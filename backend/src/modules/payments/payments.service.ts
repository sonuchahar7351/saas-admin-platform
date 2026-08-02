import { Injectable, BadRequestException } from '@nestjs/common';
import Razorpay from 'razorpay';
import * as crypto from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(private prisma: PrismaService) {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async createOrder(customerId: string, amountInRupees: number, planName: string) {
    const amountInPaise = Math.round(amountInRupees * 100);

    const order = await this.razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    await this.prisma.payment.create({
      data: {
        customerId,
        razorpayOrderId: order.id,
        amount: amountInPaise,
        status: 'CREATED',
      },
    });

    return {
      orderId: order.id,
      amount: amountInPaise,
      keyId: process.env.RAZORPAY_KEY_ID,
    };
  }

  // Verifies the webhook actually came from Razorpay, not a spoofed request
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(rawBody)
      .digest('hex');
    return expectedSignature === signature;
  }

  async handleWebhookEvent(event: any) {
    const eventType = event.event;

    if (eventType === 'payment.captured') {
      const payment = event.payload.payment.entity;

      // idempotency: if we've already marked this PAID, do nothing
      // (Razorpay can send the same webhook more than once — never assume exactly-once delivery)
      const existing = await this.prisma.payment.findUnique({
        where: { razorpayOrderId: payment.order_id },
      });
      if (!existing || existing.status === 'PAID') return;

      await this.prisma.payment.update({
        where: { razorpayOrderId: payment.order_id },
        data: { status: 'PAID', razorpayPaymentId: payment.id },
      });
    }

    if (eventType === 'payment.failed') {
      const payment = event.payload.payment.entity;
      await this.prisma.payment.updateMany({
        where: { razorpayOrderId: payment.order_id },
        data: { status: 'FAILED' },
      });
    }
  }

  getUserPayments(customerId: string) {
    return this.prisma.payment.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
