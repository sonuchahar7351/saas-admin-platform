import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { DonationsRepository } from './donations.repository';
import { CreateDonationOrderDto } from './dto/create-donation-order.dto';

@Injectable()
export class DonationsService {
  private razorpay: Razorpay;

  constructor(private repo: DonationsRepository) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(customerId: string, dto: CreateDonationOrderDto) {
    const donationAmount = Math.round(dto.amount * 100);
    const tipAmount = Math.round((dto.tipAmount || 0) * 100);
    const totalAmount = donationAmount + tipAmount;

    const order = await this.razorpay.orders.create({
      amount: totalAmount,
      currency: 'INR',
      receipt: `donation_${Date.now()}`,
    });

    await this.repo.create({
      campaignId: dto.campaignId,
      customerId,
      amount: donationAmount,
      tipAmount,
      message: dto.message,
      isAnonymous: dto.isAnonymous || false,
      razorpayOrderId: order.id,
      status: 'CREATED',
    });

    return {
      orderId: order.id,
      amount: totalAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
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

      // idempotency — same principle as your subscription payments, non-negotiable here too
      if (!donation || donation.status === 'PAID') return;

      await this.repo.updateStatus(payment.order_id, {
        status: 'PAID',
        razorpayPaymentId: payment.id,
        paymentMetadata: payment,
      });

      // increment happens exactly once, guarded by the status check above
      await this.repo.incrementCampaignRaised(
        donation.campaignId,
        donation.amount,
      );
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
}
