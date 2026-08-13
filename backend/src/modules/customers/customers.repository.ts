import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface QueryCustomers {
  page: number; limit: number; sortBy: string; sortOrder: 'asc' | 'desc'; search?: string;
}

@Injectable()
export class CustomersRepository {
  constructor(private prisma: PrismaService) {}

  async findAllWithTotals(query: QueryCustomers) {
    const { page, limit, search } = query;

    const where: any = search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] }
      : {};

    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    if (customers.length === 0) return { customers: [], total };

    // one grouped query for totals across every customer on this page — not one query per row
    const customerIds = customers.map((c) => c.id);
    const aggregates = await this.prisma.donation.groupBy({
      by: ['customerId'],
      where: { customerId: { in: customerIds }, status: 'PAID' },
      _sum: { amount: true, tipAmount: true },
      _count: { id: true },
      _max: { createdAt: true },
    });
    const aggByCustomer = new Map(aggregates.map((a) => [a.customerId, a]));

    const enriched = customers.map((c) => {
      const agg = aggByCustomer.get(c.id);
      return {
        ...c,
        totalDonationAmount: agg?._sum.amount || 0,
        totalTipAmount: agg?._sum.tipAmount || 0,
        totalTransactions: agg?._count.id || 0,
        lastDonationAt: agg?._max.createdAt || null,
      };
    });

    return { customers: enriched, total };
  }

  findById(id: string) {
    return this.prisma.customer.findUnique({ where: { id }, select: { id: true, name: true, email: true, createdAt: true } });
  }

  findDonationHistory(customerId: string, page: number, limit: number) {
    const where = { customerId };
    return Promise.all([
      this.prisma.donation.findMany({
        where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
        include: { campaign: { select: { title: true, slug: true } }, billing: true },
      }),
      this.prisma.donation.count({ where }),
    ]);
  }
}