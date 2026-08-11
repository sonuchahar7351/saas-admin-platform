import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { DonationsRepository } from './donations.repository';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { QueryDonationsDto } from './dto/query-donations.dto';
import { CreateDonationDto } from './dto/create-donation-order.dto';
import * as bcrypt from 'bcrypt';
import { ReceiptsService } from '../receipts/receipts.service';
import { VerifyDonationDto } from './dto/verify-donation.dto';

@Injectable()
export class DonationsService {
  private razorpay: Razorpay;

  constructor(
    private repo: DonationsRepository,
    private receiptsService: ReceiptsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(
    dto: CreateDonationDto,
    authenticatedCustomerId: string | null,
  ) {
    // --- 1. Enforce mutual exclusivity: exactly one of amount or products, never both, never neither ---
    const hasAmount = dto.donationType === 'AMOUNT';
    const hasProducts = dto.donationType === 'PRODUCT';

    if (hasAmount && (!dto.amount || dto.amount < 1)) {
      throw new BadRequestException(
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
      campaignId: dto.campaignId,
      customerId,
      billingId: billing.id,
      donationType: dto.donationType,
      amount: donationAmountPaise,
      tipAmount: tipPaise,
      message: dto.message,
      isAnonymous: dto.isAnonymous || false,
      razorpayOrderId: order.id,
      productItems,
    });

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

    const updatedDonation = await this.repo.updateStatus(
      dto.razorpay_order_id,
      {
        status: 'PAID',
        razorpayPaymentId: dto.razorpay_payment_id,
        paymentMetadata: JSON.stringify({
          id: donation.id,
          amount: donation.amount,
          status: donation.status,
        }),
      },
    );

    const updatedCampaign = await this.repo.incrementCampaignRaised(
      donation.campaignId,
      donation.amount,
    );

    // fire-and-forget style, but logged — a failed receipt shouldn't fail the payment webhook response
    this.receiptsService.generateForDonation(donation.id).catch((err) => {
      console.error(
        `Receipt generation failed for donation ${donation.id}:`,
        err,
      );
    });

    if (updatedDonation && updatedCampaign) {
      return {
        success: true,
        message: 'Payment verified and donation recorded',
      };
    }
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

      await this.repo.incrementCampaignRaised(
        donation.campaignId,
        donation.amount,
      );
      // fire-and-forget style, but logged — a failed receipt shouldn't fail the payment webhook response
      this.receiptsService.generateForDonation(donation.id).catch((err) => {
        console.error(
          `Receipt generation failed for donation ${donation.id}:`,
          err,
        );
      });
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const donation = await this.repo.findByOrderId(payment.order_id);
      if (!donation || donation.status !== 'CREATED') return;
      await this.repo.updateStatus(payment.order_id, { status: 'FAILED' });
    }
  }

  getMyDonations(customerId: string) {
    return this.repo.findByCustomer(customerId);
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

  async getCampaignDonors(campaignId: string) {
    const donations = await this.repo.findCampaignDonors(campaignId);
    return donations.map((d) => ({
      donorName: d.isAnonymous ? 'Anonymous' : d.billing.donorName,
      amount: d.amount,
      message: d.message,
      createdAt: d.createdAt,
    }));
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
}
