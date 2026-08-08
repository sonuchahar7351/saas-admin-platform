import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DonationsRepository {
  constructor(private prisma: PrismaService) {}

  create(data: any) {
    return this.prisma.donation.create({ data });
  }

  findByOrderId(orderId: string) {
    return this.prisma.donation.findUnique({
      where: { razorpayOrderId: orderId },
    });
  }

  updateStatus(orderId: string, data: any) {
    return this.prisma.donation.update({
      where: { razorpayOrderId: orderId },
      data,
    });
  }

  findByCustomer(customerId: string) {
    return this.prisma.donation.findMany({
      where: { customerId },
      include: { campaign: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // atomic increment — safe even if multiple webhooks somehow processed concurrently
  incrementCampaignRaised(campaignId: string, amount: number) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { raisedAmount: { increment: amount } },
    });
  }
}
