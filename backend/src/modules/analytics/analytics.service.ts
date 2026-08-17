import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';
import { CacheService } from '../../common/cache/cache.service';

// BigInt from Postgres COUNT/SUM doesn't serialize to JSON directly — convert at the boundary
function serializeBigInts(rows: any[]) {
  return rows.map((row) => {
    const out: any = {};
    for (const key in row) {
      out[key] = typeof row[key] === 'bigint' ? Number(row[key]) : row[key];
    }
    return out;
  });
}

@Injectable()
export class AnalyticsService {
  constructor(
    private repo: AnalyticsRepository,
    private cache: CacheService,
  ) {}

  getSummaryCards() {
    return this.repo.getSummaryCards();
  }

  async getDonationTrend(
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: string,
    endDate?: string,
  ) {
    const rows = await this.repo.getDonationTrend(
      period,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
    return serializeBigInts(rows);
  }

  getTopCampaigns(limit?: number) {
    return this.repo.getTopCampaigns(limit);
  }

  async getCategoryDistribution() {
    return serializeBigInts(await this.repo.getCategoryDistribution());
  }

  getPaymentStatusBreakdown() {
    return this.repo.getPaymentStatusBreakdown();
  }

  async getDonationHeatmap() {
    return serializeBigInts(await this.repo.getDonationHeatmap());
  }

  getLatestTransactions(limit?: number) {
    return this.repo.getLatestTransactions(limit);
  }

  async getPublicStats() {
    return this.cache.getOrSet('cache:analytics:public-stats', 30, async () => {
      const summary = await this.getSummaryCards();
      return {
        totalRaised: summary.totalDonations,
        totalCampaigns: summary.totalCampaigns,
        completedCampaigns: summary.completedCampaigns,
        totalDonors: summary.totalCustomers,
      };
    });
  }
}
