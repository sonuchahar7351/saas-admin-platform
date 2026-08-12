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

  findCampaignDonors(campaignId: string, limit = 20) {
    return this.prisma.donation.findMany({
      where: { campaignId, status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { billing: true },
    });
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
}
