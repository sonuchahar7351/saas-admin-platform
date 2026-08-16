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

  buildWhere(filters: {
    status?: string;
    frequency?: string;
    search?: string;
  }) {
    const { status, frequency, search } = filters;
    return {
      ...(status && { status: status as any }),
      ...(frequency && { frequency: frequency as any }),
      ...(search && {
        OR: [
          {
            billing: {
              donorName: { contains: search, mode: 'insensitive' as const },
            },
          },
          {
            billing: {
              donorEmail: { contains: search, mode: 'insensitive' as const },
            },
          },
          {
            campaign: {
              title: { contains: search, mode: 'insensitive' as const },
            },
          },
          {
            razorpaySubscriptionId: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
        ],
      }),
    };
  }

  findAllAdmin(query: {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    status?: string;
    frequency?: string;
    search?: string;
  }) {
    const where = this.buildWhere(query);
    return Promise.all([
      this.prisma.recurringDonation.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          campaign: { select: { title: true, slug: true } },
          billing: true,
        },
      }),
      this.prisma.recurringDonation.count({ where }),
    ]);
  }

  findForExportBulk(where: any) {
    return this.prisma.recurringDonation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { campaign: { select: { title: true } }, billing: true },
    });
  }
  findForExportRange(where: any, skip: number, take: number) {
    return this.prisma.recurringDonation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: { campaign: { select: { title: true } }, billing: true },
    });
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
