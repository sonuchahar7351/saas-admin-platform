import { Controller, Get, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('analytics')
@RequirePermission('analytics', 'read')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('summary')
  getSummary() {
    return this.service.getSummaryCards();
  }

  @Get('donation-trend')
  getDonationTrend(
    @Query('period') period: 'day' | 'week' | 'month' | 'year' = 'day',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getDonationTrend(period, startDate, endDate);
  }

  @Get('top-campaigns')
  getTopCampaigns(@Query('limit') limit?: string) {
    return this.service.getTopCampaigns(limit ? Number(limit) : undefined);
  }

  @Get('category-distribution')
  getCategoryDistribution() {
    return this.service.getCategoryDistribution();
  }

  @Get('payment-status')
  getPaymentStatus() {
    return this.service.getPaymentStatusBreakdown();
  }

  @Get('heatmap')
  getHeatmap() {
    return this.service.getDonationHeatmap();
  }

  @Get('latest-transactions')
  getLatestTransactions(@Query('limit') limit?: string) {
    return this.service.getLatestTransactions(
      limit ? Number(limit) : undefined,
    );
  }

  @Public()
  @Get('public/stats')
  async getPublicStats() {
    return await this.service.getPublicStats();
  }
}
