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

  findCustomerByEmail(email: string) {
    return this.prisma.customer.findUnique({ where: { email } });
  }

  createGuestCustomer(name: string, email: string, hashedPassword: string) {
    return this.prisma.customer.create({
      data: { name, email, password: hashedPassword },
    });
  }

  createBilling(data: {
    customerId: string;
    donorName: string;
    donorEmail: string;
    pincode: string;
    city?: string;
    state?: string;
    streetAddress?: string;
  }) {
    return this.prisma.billing.create({ data });
  }

  createDonationWithProducts(data: {
    campaignId: string;
    customerId: string;
    billingId: string;
    donationType: 'AMOUNT' | 'PRODUCT';
    amount: number;
    tipAmount: number;
    message?: string;
    isAnonymous: boolean;
    razorpayOrderId: string;
    productItems?: { productId: string; quantity: number; amount: number }[];
    ipAddress?: string;
  }) {
    const { productItems, ...donationData } = data;
    return this.prisma.donation.create({
      data: {
        ...donationData,
        status: 'CREATED',
        ...(productItems &&
          productItems.length > 0 && {
            products: { create: productItems },
          }),
      },
    });
  }

  findProductsByIds(ids: string[]) {
    return this.prisma.product.findMany({
      where: { id: { in: ids }, isActive: true },
    });
  }

  findCampaignDonorsPaginated(
    campaignId: string,
    page: number,
    limit: number,
    search?: string,
  ) {
    const where: any = {
      campaignId,
      status: 'PAID',
      isAnonymous: false, // anonymous donors are excluded from the list entirely, not searchable either
      ...(search && {
        billing: {
          donorName: { contains: search, mode: 'insensitive' as const },
        },
      }),
    };
    return Promise.all([
      this.prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { billing: true },
      }),
      this.prisma.donation.count({ where }),
    ]);
  }

  findPublicSummary(id: string) {
    return this.prisma.donation.findUnique({
      where: { id },
      include: {
        campaign: { select: { title: true, slug: true } },
        billing: true,
        products: { include: { product: { select: { title: true } } } },
        receipt: true,
      },
    });
  }

  findByCustomerPaginated(customerId: string, page: number, limit: number) {
    const where = { customerId };
    return Promise.all([
      this.prisma.donation.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          campaign: { select: { title: true, slug: true } },
          billing: true,
        },
      }),
      this.prisma.donation.count({ where }),
    ]);
  }

  buildExportWhere(filters: {
    status?: string;
    campaignId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const { status, campaignId, search, startDate, endDate } = filters;
    return {
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
            razorpayPaymentId: {
              contains: search,
              mode: 'insensitive' as const,
            },
          },
          {
            razorpayOrderId: { contains: search, mode: 'insensitive' as const },
          },
          {
            campaign: {
              slug: { contains: search, mode: 'insensitive' as const },
            },
          },
        ],
      }),
    };
  }

  findForExportBulk(where: any) {
    return this.prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { title: true, slug: true } },
        billing: true,
      },
    });
  }

  findForExportRange(where: any, skip: number, take: number) {
    return this.prisma.donation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        campaign: { select: { title: true, slug: true } },
        billing: true,
      },
    });
  }

  findForExportSelected(ids: string[]) {
    return this.prisma.donation.findMany({
      where: { id: { in: ids } },
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { title: true, slug: true } },
        billing: true,
      },
    });
  }

  countRecentByEmail(email: string, sinceMinutes: number) {
    return this.prisma.donation.count({
      where: {
        billing: { donorEmail: email },
        createdAt: { gte: new Date(Date.now() - sinceMinutes * 60000) },
      },
    });
  }

  countRecentFailedByEmailOrIp(
    email: string,
    ipAddress: string | undefined,
    sinceMinutes: number,
  ) {
    return this.prisma.donation.count({
      where: {
        status: 'FAILED',
        createdAt: { gte: new Date(Date.now() - sinceMinutes * 60000) },
        OR: [
          { billing: { donorEmail: email } },
          ...(ipAddress ? [{ ipAddress }] : []),
        ],
      },
    });
  }

  countDistinctDonorsFromIp(ipAddress: string, sinceMinutes: number) {
    return this.prisma.donation.findMany({
      where: {
        ipAddress,
        createdAt: { gte: new Date(Date.now() - sinceMinutes * 60000) },
      },
      select: { billing: { select: { donorEmail: true } } },
      distinct: ['billingId'],
    });
  }

  getCampaignAverageDonation(campaignId: string) {
    return this.prisma.donation.aggregate({
      where: { campaignId, status: 'PAID' },
      _avg: { amount: true },
      _count: true,
    });
  }

  createFraudFlag(data: {
    donationId: string;
    ruleCode: string;
    severity: string;
    details: any;
  }) {
    return this.prisma.fraudFlag.create({ data: data as any });
  }

  getLeaderboard(campaignId?: string, limit = 10) {
    return this.prisma.donation.groupBy({
      by: ['billingId'],
      where: {
        status: 'PAID',
        isAnonymous: false,
        ...(campaignId && { campaignId }),
      },
      _sum: { amount: true },
      _count: { id: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: limit,
    });
  }

  getBillingDetails(billingIds: string[]) {
    return this.prisma.billing.findMany({
      where: { id: { in: billingIds } },
      select: { id: true, donorName: true },
    });
  }
}
