import { Injectable, Logger } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { DonationsRepository } from './donations.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QueryDonationsDto } from './dto/query-donations.dto';
import { CreateDonationDto } from './dto/create-donation-order.dto';
import * as bcrypt from 'bcrypt';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { ExportDonationsDto } from './dto/export-donations.dto';
import { buildDonationsWorkbook } from './excel-export.util';
import { ReceiptsQueueService } from '../../queues/receipts/receipts-queue.service';
import {
  BusinessRuleViolationException,
  CampaignNotAcceptingDonationsException,
} from '../../common/exceptions/app-exceptions';
import { FraudDetectionService } from './fraud.service';
import { AiService } from '../ai/ai.service';
import { CacheService } from '../../common/cache/cache.service';
import { CampaignStatusService } from '../campaigns/campaign-status.service';
import { CampaignsRepository } from '../campaigns/campaigns.repository';
import { CampaignsService } from '../campaigns/campaigns.service';

@Injectable()
export class DonationsService {
  private razorpay: Razorpay;
  private logger = new Logger(DonationsService.name);

  constructor(
    private repo: DonationsRepository,
    private receiptsQueue: ReceiptsQueueService,
    private fraudDetection: FraudDetectionService,
    private aiService: AiService,
    private cache: CacheService,
    private statusService: CampaignStatusService,
    private campaignsRepo: CampaignsRepository,
    private campaignsService: CampaignsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(
    dto: CreateDonationDto,
    authenticatedCustomerId: string | null,
    ipAddress?: string,
  ) {
    const sourceCampaign = await this.campaignsRepo.findRawById(dto.campaignId); // inject CampaignsRepository
    if (!sourceCampaign) throw new NotFoundException('Campaign not found');

    const financialCampaignId = sourceCampaign.isMorph
      ? sourceCampaign.parentCampaignId!
      : sourceCampaign.id;

    const financialCampaign = sourceCampaign.isMorph
      ? await this.campaignsRepo.findRawById(financialCampaignId)
      : sourceCampaign;

    const evaluation = this.statusService.evaluate({
      status: financialCampaign!.status,
      goalAmount: financialCampaign!.goalAmount,
      raisedAmount: financialCampaign!.raisedAmount,
      expiryDate: financialCampaign!.expiryDate,
    });

    if (!evaluation.canAcceptDonations)
      throw new CampaignNotAcceptingDonationsException();

    // --- 1. Enforce mutual exclusivity: exactly one of amount or products, never both, never neither ---
    const hasAmount = dto.donationType === 'AMOUNT';
    const hasProducts = dto.donationType === 'PRODUCT';

    if (hasAmount && (!dto.amount || dto.amount < 1)) {
      throw new BusinessRuleViolationException(
        'DONATION_AMOUNT_REQUIRED',
        'A donation amount is required for an AMOUNT donation.',
      );
    }

    if (hasProducts && (!dto.products || dto.products.length === 0)) {
      throw new BadRequestException(
        'At least one product is required for a PRODUCT donation.',
      );
    }

    // --- 2. Resolve customer identity: logged-in user, existing guest by email, or brand-new guest ---
    let customerId = authenticatedCustomerId;

    if (!customerId) {
      const existing = await this.repo.findCustomerByEmail(dto.donor.email);
      if (existing) {
        customerId = existing.id; // never create a duplicate account for an email that already exists
      } else {
        if (!dto.guestPassword) {
          throw new BadRequestException(
            'A password is required to create a new account for this donation.',
          );
        }
        const hashed = await bcrypt.hash(dto.guestPassword, 10);
        const newCustomer = await this.repo.createGuestCustomer(
          dto.donor.name,
          dto.donor.email,
          hashed,
        );
        customerId = newCustomer.id;
      }
    }

    // --- 3. Billing record — the actual donor identity for THIS donation, independent of the customer account ---
    const billing = await this.repo.createBilling({
      customerId,
      donorName: dto.donor.name,
      donorEmail: dto.donor.email,
      pincode: dto.donor.pincode,
      city: dto.donor.city,
      state: dto.donor.state,
      streetAddress: dto.donor.streetAddress,
    });

    // --- 4. Compute the actual payable amount — server-trusted, never from client-sent totals ---
    let donationAmountPaise: number;
    let productItems:
      { productId: string; quantity: number; amount: number }[] | undefined;

    if (hasAmount) {
      donationAmountPaise = Math.round(dto.amount! * 100);
    } else {
      const products = await this.repo.findProductsByIds(
        dto.products!.map((p) => p.productId),
      );
      if (products.length !== dto.products!.length) {
        throw new BadRequestException(
          'One or more selected products are no longer available.',
        );
      }
      productItems = dto.products!.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          productId: item.productId,
          quantity: item.quantity,
          amount: product.amount * item.quantity,
        };
      });

      donationAmountPaise = productItems.reduce((sum, p) => sum + p.amount, 0);
    }

    const tipPaise = Math.round((dto.tipAmount || 0) * 100);
    const totalPayable = donationAmountPaise + tipPaise;

    // --- 5. Razorpay order + Donation row, same pattern as before ---
    const order = await this.razorpay.orders.create({
      amount: totalPayable,
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
    });

    const donation = await this.repo.createDonationWithProducts({
      campaignId: financialCampaignId, // ALWAYS the financial parent — same as before this feature existed
      sourceCampaignId: sourceCampaign.id,
      customerId,
      billingId: billing.id,
      donationType: dto.donationType,
      amount: donationAmountPaise,
      tipAmount: tipPaise,
      message: dto.message,
      isAnonymous: dto.isAnonymous || false,
      razorpayOrderId: order.id,
      productItems,
      ipAddress,
    });

    this.fraudDetection
      .evaluate(
        donation.id,
        dto.campaignId,
        dto.donor.email,
        donationAmountPaise,
        ipAddress,
      )
      .catch(() => {});

    return {
      orderId: order.id,
      amount: totalPayable,
      keyId: process.env.RAZORPAY_KEY_ID,
      donationId: donation.id,
    };
  }

  async verifyPayment(dto: VerifyDonationDto) {
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${dto.razorpay_order_id}|${dto.razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== dto.razorpay_signature) {
      throw new BadRequestException('Invalid payment signature');
    }

    const donation = await this.repo.findByOrderId(dto.razorpay_order_id);

    if (!donation) {
      throw new NotFoundException('Donation not found');
    }

    if (donation.status === 'PAID') {
      return {
        success: true,
        message: 'Payment already verified',
      };
    }

    await this.repo.updateStatus(dto.razorpay_order_id, {
      status: 'PAID',
      razorpayPaymentId: dto.razorpay_payment_id,
      paymentMetadata: JSON.stringify({
        id: donation.id,
        amount: donation.amount,
        status: donation.status,
      }),
    });

    const updatedCampaign = await this.repo.incrementCampaignRaised(
      donation.campaignId,
      donation.amount,
    );

    const evaluation = this.statusService.evaluate({
      status: updatedCampaign.status,
      goalAmount: updatedCampaign.goalAmount,
      raisedAmount: updatedCampaign.raisedAmount,
      expiryDate: updatedCampaign.expiryDate,
    });

    if (evaluation.shouldAutoComplete) {
      await this.repo.updateCampaignStatus(donation.campaignId, 'COMPLETED');
      await this.campaignsService.cascadeCompleteMorphsForParent(
        donation.campaignId,
      ); // NEW
      this.logger.log(
        `Campaign ${donation.campaignId} auto-completed: ${evaluation.completionReason}`,
      );
    }

    // fire-and-forget style, but logged — a failed receipt shouldn't fail the payment webhook response
    await this.receiptsQueue.queueGenerate(donation.id);
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');
    return expected === signature;
  }

  async handleWebhookEvent(event: any) {
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const donation = await this.repo.findByOrderId(payment.order_id);
      if (!donation || donation.status === 'PAID') return;

      await this.repo.updateStatus(payment.order_id, {
        status: 'PAID',
        razorpayPaymentId: payment.id,
        paymentMetadata: payment,
      });

      const updatedCampaign = await this.repo.incrementCampaignRaised(
        donation.campaignId,
        donation.amount,
      );

      const evaluation = this.statusService.evaluate({
        status: updatedCampaign.status,
        goalAmount: updatedCampaign.goalAmount,
        raisedAmount: updatedCampaign.raisedAmount,
        expiryDate: updatedCampaign.expiryDate,
      });

      if (evaluation.shouldAutoComplete) {
        await this.repo.updateCampaignStatus(donation.campaignId, 'COMPLETED');
        await this.campaignsService.cascadeCompleteMorphsForParent(
          donation.campaignId,
        ); // NEW
        this.logger.log(
          `Campaign ${donation.campaignId} auto-completed: ${evaluation.completionReason}`,
        );
      }

      // fire-and-forget style, but logged — a failed receipt shouldn't fail the payment webhook response
      await this.receiptsQueue.queueGenerate(donation.id);
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const donation = await this.repo.findByOrderId(payment.order_id);
      if (!donation || donation.status !== 'CREATED') return;
      await this.repo.updateStatus(payment.order_id, { status: 'FAILED' });
    }
  }

  async findAllAdmin(query: QueryDonationsDto) {
    const [data, total] = await this.repo.findAllAdmin(query);
    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findByIdAdmin(id: string) {
    const donation = await this.repo.findByIdAdmin(id);
    if (!donation) throw new NotFoundException('Donation not found');
    return donation;
  }

  async refund(id: string) {
    const donation = await this.repo.findByIdAdmin(id);
    if (!donation) throw new NotFoundException('Donation not found');
    if (donation.status !== 'PAID') {
      throw new BadRequestException(
        `Only PAID donations can be refunded. Current status: ${donation.status}`,
      );
    }
    if (!donation.razorpayPaymentId) {
      throw new BadRequestException(
        'No payment ID on record for this donation',
      );
    }

    await this.razorpay.payments.refund(donation.razorpayPaymentId, {
      amount: donation.amount + donation.tipAmount,
    });

    // Note: Razorpay also sends a `refund.processed` webhook — in a full production build,
    // the DEFINITIVE status update should happen there (same reasoning as payment.captured:
    // never trust the synchronous API response alone as the source of truth). Updating here
    // too gives immediate UI feedback; the webhook is the authoritative confirmation.
    await this.repo.updateStatus(donation.razorpayOrderId, {
      status: 'REFUNDED',
    });
    await this.repo.incrementCampaignRaised(
      donation.campaignId,
      -donation.amount,
    );

    return { message: 'Refund initiated' };
  }

  async getCampaignDonors(
    campaignId: string,
    page = 1,
    limit = 10,
    search?: string,
  ) {
    const [donations, total] = await this.repo.findCampaignDonorsPaginated(
      campaignId,
      page,
      limit,
      search,
    );
    return {
      data: donations.map((d) => ({
        donorName: d.billing.donorName,
        amount: d.amount,
        message: d.message,
        createdAt: d.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPublicSummary(id: string) {
    const donation = await this.repo.findPublicSummary(id);
    if (!donation) throw new NotFoundException('Donation not found');

    return {
      id: donation.id,
      status: donation.status,
      donationType: donation.donationType,
      campaignTitle: donation.campaign.title,
      campaignSlug: donation.campaign.slug,
      donorName: donation.isAnonymous
        ? 'Anonymous'
        : donation.billing.donorName,
      donorEmail: donation.billing.donorEmail,
      amount: donation.amount,
      tipAmount: donation.tipAmount,
      totalAmount: donation.amount + donation.tipAmount,
      paymentId: donation.razorpayPaymentId,
      createdAt: donation.createdAt,
      message: donation.message,
      products: donation.products.map((p) => ({
        title: p.product.title,
        quantity: p.quantity,
        amount: p.amount,
      })),
      receiptUrl: donation.receipt?.pdfUrl || null,
    };
  }

  async getMyDonations(customerId: string, page = 1, limit = 10) {
    const [data, total] = await this.repo.findByCustomerPaginated(
      customerId,
      page,
      limit,
    );
    return {
      data: data.map((d) => ({
        id: d.id,
        campaignTitle: d.campaign.title,
        campaignSlug: d.campaign.slug,
        donorName: d.isAnonymous ? 'Anonymous' : d.billing.donorName,
        amount: d.amount,
        tipAmount: d.tipAmount,
        totalAmount: d.amount + d.tipAmount,
        status: d.status,
        donationType: d.donationType,
        createdAt: d.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyDonationDetail(customerId: string, donationId: string) {
    const donation = await this.repo.findPublicSummary(donationId); // reuse the same query as the Thank You summary
    if (!donation || donation.customerId !== customerId) {
      throw new NotFoundException('Donation not found'); // same "don't reveal existence" principle as receipts
    }
    return this.getPublicSummary(donationId); // reuse the exact same shaping logic — one source of truth for this shape
  }

  async exportDonations(dto: ExportDonationsDto) {
    const where = this.repo.buildExportWhere(dto);

    let donations: any[];

    if (dto.mode === 'bulk') {
      donations = await this.repo.findForExportBulk(where);
    } else if (dto.mode === 'range') {
      if (!dto.rangeStart || !dto.rangeEnd || dto.rangeEnd < dto.rangeStart) {
        throw new BadRequestException(
          'A valid range (e.g. start=1, end=200) is required.',
        );
      }
      const skip = dto.rangeStart - 1;
      const take = dto.rangeEnd - dto.rangeStart + 1;
      donations = await this.repo.findForExportRange(where, skip, take);
    } else {
      // selected — respects filters too: only export selected IDs that also still match the current filter set
      if (!dto.selectedIds || dto.selectedIds.length === 0) {
        throw new BadRequestException('Select at least one row to export.');
      }
      const allMatching = await this.repo.findForExportBulk(where);
      const matchingIds = new Set(allMatching.map((d) => d.id));
      donations = allMatching.filter(
        (d) => dto.selectedIds!.includes(d.id) && matchingIds.has(d.id),
      );
    }

    return buildDonationsWorkbook(donations);
  }

  async findFraudFlags(query: {
    page: number;
    limit: number;
    severity?: string;
    reviewed?: boolean;
  }) {
    const where: any = {
      ...(query.severity && { severity: query.severity }),
      ...(query.reviewed !== undefined && { reviewed: query.reviewed }),
    };
    const [data, total] = await Promise.all([
      this.repo['prisma'].fraudFlag.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          donation: {
            include: { billing: true, campaign: { select: { title: true } } },
          },
        },
      }),
      this.repo['prisma'].fraudFlag.count({ where }),
    ]);
    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async markFraudFlagReviewed(id: string, reviewedById: string) {
    return this.repo['prisma'].fraudFlag.update({
      where: { id },
      data: { reviewed: true, reviewedById },
    });
  }

  async explainFlag(id: string) {
    const flag = await this.repo['prisma'].fraudFlag.findUniqueOrThrow({
      where: { id },
      include: { donation: { include: { billing: true } } },
    });

    const explanation = await this.aiService.explainFraudFlag({
      ruleCode: flag.ruleCode,
      details: flag.details,
      donorEmail: flag.donation.billing.donorEmail,
      amount: flag.donation.amount,
    });
    return { explanation };
  }

  async getLeaderboard(campaignId?: string, limit = 10) {
    const key = `cache:leaderboard:${campaignId || 'platform'}`;
    return this.cache.getOrSet(key, 300, async () => {
      // 5 min TTL — a leaderboard doesn't need to-the-second freshness
      const grouped = await this.repo.getLeaderboard(campaignId, limit);
      if (grouped.length === 0) return [];

      const billings = await this.repo.getBillingDetails(
        grouped.map((g) => g.billingId),
      );
      const nameById = new Map(billings.map((b) => [b.id, b.donorName]));

      return grouped.map((g, i) => ({
        rank: i + 1,
        donorName: nameById.get(g.billingId) || 'Donor',
        totalAmount: g._sum.amount || 0,
        donationCount: g._count.id,
      }));
    });
  }
}
