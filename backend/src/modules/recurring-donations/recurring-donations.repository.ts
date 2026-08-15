import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RecurringDonationsRepository {
  constructor(private prisma: PrismaService) {}

  findCachedPlan(campaignId: string, amount: number, frequency: string) {
    return this.prisma.recurringPlanCache.findUnique({
      where: {
        campaignId_amount_frequency: {
          campaignId,
          amount,
          frequency: frequency as any,
        },
      },
    });
  }
  cachePlan(
    campaignId: string,
    amount: number,
    frequency: string,
    razorpayPlanId: string,
  ) {
    return this.prisma.recurringPlanCache.create({
      data: { campaignId, amount, frequency: frequency as any, razorpayPlanId },
    });
  }

  createBilling(data: any) {
    return this.prisma.billing.create({ data });
  }

  create(data: any) {
    return this.prisma.recurringDonation.create({ data });
  }

  findBySubscriptionId(subscriptionId: string) {
    return this.prisma.recurringDonation.findUnique({
      where: { razorpaySubscriptionId: subscriptionId },
    });
  }

  findById(id: string) {
    return this.prisma.recurringDonation.findUnique({ where: { id } });
  }

  updateStatus(id: string, status: any, extra: any = {}) {
    return this.prisma.recurringDonation.update({
      where: { id },
      data: { status, ...extra },
    });
  }

  findByCustomer(customerId: string) {
    return this.prisma.recurringDonation.findMany({
      where: { customerId },
      include: {
        campaign: { select: { title: true, slug: true } },
        billing: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllAdmin(query: { page: number; limit: number; status?: string }) {
    const where = query.status ? { status: query.status as any } : {};
    return Promise.all([
      this.prisma.recurringDonation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: { campaign: { select: { title: true } }, billing: true },
      }),
      this.prisma.recurringDonation.count({ where }),
    ]);
  }

  createChargeDonation(data: any) {
    return this.prisma.donation.create({ data });
  }

  incrementCampaignRaised(campaignId: string, amount: number) {
    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: { raisedAmount: { increment: amount } },
    });
  }
}
