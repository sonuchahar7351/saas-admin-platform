import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import Razorpay from 'razorpay';
import { RecurringDonationsRepository } from './recurring-donations.repository';
import { SetupRecurringDto } from './dto/setup-recurring.dto';
import { CustomerResolutionService } from '../customer-auth/customer-resolution.service';
import {
  ExportRecurringDto,
  QueryRecurringDto,
} from './dto/query-recurring.dto';
import { buildRecurringWorkbook } from './excel-export.util';
import { CampaignStatusService } from '../campaigns/campaign-status.service';
import { CampaignsService } from '../campaigns/campaigns.service';

// Razorpay requires a finite total_count of billing cycles — there's no "forever" option.
// We use a large-but-finite count per frequency (roughly a 5-year horizon) and let
// customers/admins cancel anytime well before that's ever reached in practice.
const TOTAL_COUNT: Record<string, number> = {
  WEEKLY: 260,
  MONTHLY: 60,
  QUARTERLY: 20,
};
const RAZORPAY_PERIOD: Record<string, string> = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'monthly',
}; // Razorpay has no native "quarterly" — modeled as every 3rd monthly interval
const RAZORPAY_INTERVAL: Record<string, number> = {
  WEEKLY: 1,
  MONTHLY: 1,
  QUARTERLY: 3,
};

@Injectable()
export class RecurringDonationsService {
  private logger = new Logger(RecurringDonationsService.name);
  private razorpay: Razorpay;

  constructor(
    private repo: RecurringDonationsRepository,
    private customerResolution: CustomerResolutionService,
    private statusService: CampaignStatusService,
    private campaignsService: CampaignsService,
  ) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  private async findOrCreatePlan(
    campaignId: string,
    campaignTitle: string,
    amountPaise: number,
    frequency: string,
  ) {
    const cached = await this.repo.findCachedPlan(
      campaignId,
      amountPaise,
      frequency,
    );
    if (cached) return cached.razorpayPlanId;

    const plan = await this.razorpay.plans.create({
      period: RAZORPAY_PERIOD[frequency] as any,
      interval: RAZORPAY_INTERVAL[frequency],
      item: {
        name: `${campaignTitle} — ${frequency.toLowerCase()} donation`,
        amount: amountPaise,
        currency: 'INR',
      },
    });

    await this.repo.cachePlan(campaignId, amountPaise, frequency, plan.id);
    return plan.id;
  }

  async setup(
    dto: SetupRecurringDto,
    authenticatedCustomerId: string | null,
    campaignTitle: string,
  ) {
    const customerId = await this.customerResolution.resolveCustomerId(
      authenticatedCustomerId,
      dto.donor.email,
      dto.donor.name,
      dto.guestPassword,
    );

    const billing = await this.repo.createBilling({
      customerId,
      donorName: dto.donor.name,
      donorEmail: dto.donor.email,
      pincode: dto.donor.pincode,
      city: dto.donor.city,
      state: dto.donor.state,
      streetAddress: dto.donor.streetAddress,
    });

    const amountPaise = Math.round(dto.amount * 100);
    const planId = await this.findOrCreatePlan(
      dto.campaignId,
      campaignTitle,
      amountPaise,
      dto.frequency,
    );

    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1, // Razorpay emails the customer directly about charges/failures — real safety net beyond our own emails
      total_count: TOTAL_COUNT[dto.frequency],
      notes: { campaignId: dto.campaignId, customerId, billingId: billing.id },
    } as any);

    const record = await this.repo.create({
      campaignId: dto.campaignId,
      customerId,
      billingId: billing.id,
      frequency: dto.frequency,
      amount: amountPaise,
      tipPercentage: dto.tipPercentage || 0,
      status: 'CREATED',
      razorpayPlanId: planId,
      razorpaySubscriptionId: subscription.id,
      nextChargeDate: (subscription as any).current_end
        ? new Date((subscription as any).current_end * 1000)
        : null,
    });

    // frontend opens Razorpay Checkout with subscription_id (not order_id) —
    // this is where the customer actually authorizes the mandate/UPI Autopay
    return {
      recurringDonationId: record.id,
      subscriptionId: subscription.id,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  getMyRecurring(customerId: string) {
    return this.repo.findByCustomer(customerId);
  }

  async cancel(id: string, customerId: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundException('Recurring donation not found');
    if (record.customerId !== customerId) throw new ForbiddenException();
    if (record.status === 'CANCELLED') return record;

    await this.razorpay.subscriptions.cancel(record.razorpaySubscriptionId); // Razorpay is the source of truth — cancel there first
    return this.repo.updateStatus(id, 'CANCELLED', { cancelledAt: new Date() });
  }

  async findAllAdmin(query: QueryRecurringDto) {
    const [data, total] = await this.repo.findAllAdmin(query);
    return {
      data,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async exportRecurring(dto: ExportRecurringDto) {
    const where = this.repo.buildWhere(dto);
    let items: any[];

    if (dto.mode === 'bulk') {
      items = await this.repo.findForExportBulk(where);
    } else if (dto.mode === 'range') {
      if (!dto.rangeStart || !dto.rangeEnd || dto.rangeEnd < dto.rangeStart) {
        throw new BadRequestException('A valid range is required.');
      }
      items = await this.repo.findForExportRange(
        where,
        dto.rangeStart - 1,
        dto.rangeEnd - dto.rangeStart + 1,
      );
    } else {
      if (!dto.selectedIds?.length)
        throw new BadRequestException('Select at least one row to export.');
      const allMatching = await this.repo.findForExportBulk(where);
      items = allMatching.filter((r) => dto.selectedIds!.includes(r.id));
    }

    return buildRecurringWorkbook(items);
  }

  async adminPause(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundException('Recurring donation not found');
    await this.razorpay.subscriptions.pause(record.razorpaySubscriptionId, {
      pause_at: 'now',
    } as any);
    return this.repo.updateStatus(id, 'PAUSED');
  }

  async adminResume(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundException('Recurring donation not found');
    await this.razorpay.subscriptions.resume(record.razorpaySubscriptionId, {
      resume_at: 'now',
    } as any);
    return this.repo.updateStatus(id, 'ACTIVE');
  }

  async adminCancel(id: string) {
    const record = await this.repo.findById(id);
    if (!record) throw new NotFoundException('Recurring donation not found');
    await this.razorpay.subscriptions.cancel(record.razorpaySubscriptionId);
    return this.repo.updateStatus(id, 'CANCELLED', { cancelledAt: new Date() });
  }

  verifyWebhookSignature(rawBody: Buffer, signature: string) {
    const {
      verifyRazorpaySignature,
    } = require('../../common/utils/razorpay-webhook.util');
    return verifyRazorpaySignature(
      rawBody,
      signature,
      process.env.RAZORPAY_RECURRING_WEBHOOK_SECRET!,
    );
  }

  async handleWebhookEvent(event: any) {
    const eventType = event.event;
    const subscriptionEntity = event.payload?.subscription?.entity;
    if (!subscriptionEntity) return;

    const record = await this.repo.findBySubscriptionId(subscriptionEntity.id);
    if (!record) {
      this.logger.warn(
        `Webhook for unknown subscription ${subscriptionEntity.id}`,
      );
      return;
    }
    const nextChargeDate = subscriptionEntity.current_end
      ? new Date(subscriptionEntity.current_end * 1000)
      : undefined;

    switch (eventType) {
      case 'subscription.activated':
        await this.repo.updateStatus(record.id, 'ACTIVE', {
          ...(nextChargeDate && { nextChargeDate }),
        });
        break;

      case 'subscription.charged': {
        const payment = event.payload.payment.entity;

        // idempotency: skip if we've already recorded this exact payment
        const alreadyRecorded = await this.repo['prisma'].donation.findFirst({
          where: { razorpayPaymentId: payment.id },
        });
        if (alreadyRecorded) break;

        const tipAmount = Math.round(
          (record.amount * record.tipPercentage) / 100,
        );

        await this.repo.createChargeDonation({
          campaignId: record.campaignId,
          customerId: record.customerId,
          billingId: record.billingId,
          recurringDonationId: record.id,
          amount: record.amount,
          tipAmount,
          donationType: 'AMOUNT',
          razorpayOrderId: payment.order_id || `sub_charge_${payment.id}`, // subscription charges may not always carry an order_id — fall back to a synthetic unique value
          razorpayPaymentId: payment.id,
          status: 'PAID',
          paymentMetadata: payment,
        });

        const updatedCampaign = await this.repo.incrementCampaignRaised(
          record.campaignId,
          record.amount,
        );

        const evaluation = this.statusService.evaluate({
          status: updatedCampaign.status,
          goalAmount: updatedCampaign.goalAmount,
          raisedAmount: updatedCampaign.raisedAmount,
          expiryDate: updatedCampaign.expiryDate,
        });

        if (evaluation.shouldAutoComplete) {
          await this.repo.updateCampaignStatus(record.campaignId, 'COMPLETED');
          await this.campaignsService.cascadeCompleteMorphsForParent(
            record.campaignId,
          ); // NEW
          this.logger.log(
            `Campaign ${record.campaignId} auto-completed: ${evaluation.completionReason}`,
          );
        }

        if (record.status !== 'ACTIVE')
          await this.repo.updateStatus(record.id, 'ACTIVE', {
            ...(nextChargeDate && { nextChargeDate }),
          });
        break;
      }

      case 'subscription.paused':
        await this.repo.updateStatus(record.id, 'PAUSED');
        break;

      case 'subscription.halted':
        await this.repo.updateStatus(record.id, 'HALTED', {
          nextChargeDate: null,
        }); // no future charge is actually scheduled once halted

        this.logger.warn(
          `Subscription ${record.id} halted — repeated charge failures. Customer's bank likely declined the mandate.`,
        );
        break;

      case 'subscription.cancelled':
        await this.repo.updateStatus(record.id, 'CANCELLED', {
          cancelledAt: new Date(),
        });
        break;

      case 'subscription.completed':
        await this.repo.updateStatus(record.id, 'COMPLETED', {
          nextChargeDate: null,
        });
        break;
    }
  }
}
