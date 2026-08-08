import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueryDonationsDto } from './dto/query-donations.dto';

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

  findAllAdmin(query: QueryDonationsDto) {
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      status,
      campaignId,
      search,
      startDate,
      endDate,
    } = query;

    const where: any = {
      ...(status && { status }),
      ...(campaignId && { campaignId }),
      ...((startDate || endDate) && {
        createdAt: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      }),
      ...(search && {
        OR: [
          { customer: { name: { contains: search, mode: 'insensitive' } } },
          { customer: { email: { contains: search, mode: 'insensitive' } } },
          { razorpayPaymentId: { contains: search, mode: 'insensitive' } },
          { razorpayOrderId: { contains: search, mode: 'insensitive' } },
          { campaign: { slug: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    // sortBy might target a relation field (e.g. "campaign.title") — handle both cases
    const orderBy = sortBy.includes('.')
      ? { [sortBy.split('.')[0]]: { [sortBy.split('.')[1]]: sortOrder } }
      : { [sortBy]: sortOrder };

    return Promise.all([
      this.prisma.donation.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { title: true, slug: true } },
          customer: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.donation.count({ where }),
    ]);
  }

  findByIdAdmin(id: string) {
    return this.prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: { select: { title: true, slug: true } },
        customer: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
