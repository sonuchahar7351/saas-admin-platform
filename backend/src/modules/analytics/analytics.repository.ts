import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsRepository {
  constructor(private prisma: PrismaService) {}

  async getSummaryCards() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalDonations,
      todayDonations,
      monthlyDonations,
      totalCampaigns,
      runningCampaigns,
      completedCampaigns,
      totalCustomers,
      failedPayments,
      avgDonation,
      avgTip,
    ] = await Promise.all([
      this.prisma.donation.aggregate({
        where: { status: 'PAID' },
        _sum: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'PAID', createdAt: { gte: startOfToday } },
        _sum: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      this.prisma.campaign.count({ where: { status: { not: 'DELETED' } } }),
      this.prisma.campaign.count({ where: { status: 'ACTIVE' } }),
      this.prisma.campaign.count({ where: { status: 'COMPLETED' } }),
      this.prisma.customer.count(),
      this.prisma.donation.count({ where: { status: 'FAILED' } }),
      this.prisma.donation.aggregate({
        where: { status: 'PAID' },
        _avg: { amount: true },
      }),
      this.prisma.donation.aggregate({
        where: { status: 'PAID' },
        _avg: { tipAmount: true },
      }),
    ]);

    return {
      totalDonations: totalDonations._sum.amount || 0,
      todayDonations: todayDonations._sum.amount || 0,
      monthlyDonations: monthlyDonations._sum.amount || 0,
      totalCampaigns,
      runningCampaigns,
      completedCampaigns,
      totalCustomers,
      failedPayments,
      averageDonation: Math.round(avgDonation._avg.amount || 0),
      averageTip: Math.round(avgTip._avg.tipAmount || 0),
    };
  }

  // raw SQL here because Prisma's query builder can't express "group by truncated date" —
  // this is a legitimate, common case for dropping to raw SQL rather than fighting the ORM
  async getDonationTrend(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date,
  ) {
    const truncUnit =
      period === 'day'
        ? 'day'
        : period === 'week'
          ? 'week'
          : period === 'month'
            ? 'month'
            : 'year';
    const from = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const to = endDate || new Date();

    return this.prisma.$queryRaw<{ bucket: Date; total: bigint }[]>`
      SELECT date_trunc(${truncUnit}, "createdAt") as bucket, SUM(amount) as total
      FROM donations
      WHERE status = 'PAID' AND "createdAt" BETWEEN ${from} AND ${to}
      GROUP BY bucket
      ORDER BY bucket ASC
    `;
  }

  async getTopCampaigns(limit = 5) {
    return this.prisma.campaign.findMany({
      where: { status: { not: 'DELETED' } },
      orderBy: { raisedAmount: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        raisedAmount: true,
        goalAmount: true,
      },
    });
  }

  async getCategoryDistribution() {
    return this.prisma.$queryRaw<{ category: string; total: bigint }[]>`
      SELECT c.name as category, COALESCE(SUM(d.amount), 0) as total
      FROM categories c
      LEFT JOIN campaigns camp ON camp."categoryId" = c.id
      LEFT JOIN donations d ON d."campaignId" = camp.id AND d.status = 'PAID'
      GROUP BY c.name
      ORDER BY total DESC
    `;
  }

  async getPaymentStatusBreakdown() {
    const results = await this.prisma.donation.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    return results.map((r) => ({ status: r.status, count: r._count.status }));
  }

  async getDonationHeatmap() {
    // hour-of-day x day-of-week donation density — useful for "when do people donate" insight
    return this.prisma.$queryRaw<
      { dow: number; hour: number; total: bigint }[]
    >`
      SELECT
        EXTRACT(DOW FROM "createdAt")::int as dow,
        EXTRACT(HOUR FROM "createdAt")::int as hour,
        COUNT(*) as total
      FROM donations
      WHERE status = 'PAID'
      GROUP BY dow, hour
    `;
  }

  async getLatestTransactions(limit = 10) {
    return this.prisma.donation.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: { select: { title: true, slug: true } },
        customer: { select: { name: true, email: true } },
      },
    });
  }
}
