import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AnalyticsService } from '../../modules/analytics/analytics.service';
import { EmailQueueService } from '../email/email-queue.service';
import { PrismaService } from '../../prisma/prisma.service';

@Processor('reports')
export class ReportsProcessor extends WorkerHost {
  private logger = new Logger(ReportsProcessor.name);

  constructor(
    private analyticsService: AnalyticsService,
    private emailQueue: EmailQueueService,
    private prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    if (job.name !== 'weekly-summary') return;

    const summary = await this.analyticsService.getSummaryCards();
    const topCampaigns = await this.analyticsService.getTopCampaigns(5);

    const superAdmins = await this.prisma.user.findMany({
      where: { role: { name: 'SUPER_ADMIN' }, isActive: true },
      select: { email: true, name: true },
    });

    for (const admin of superAdmins) {
      await this.emailQueue.queueWeeklyReport(
        admin.email,
        admin.name,
        summary,
        topCampaigns,
      );
    }

    this.logger.log(
      `Weekly report queued for ${superAdmins.length} Super Admin(s)`,
    );
  }
}
