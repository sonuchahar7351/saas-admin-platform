import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ReportsProcessor } from './reports.processor';
import { AnalyticsModule } from '../../modules/analytics/analytics.module';
import { EmailQueueModule } from '../email/email-queue.module';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'reports' }),
    AnalyticsModule,
    EmailQueueModule,
    PrismaModule,
  ],
  providers: [ReportsProcessor],
})
export class ReportsQueueModule implements OnModuleInit {
  constructor(@InjectQueue('reports') private queue: Queue) {}

  async onModuleInit() {
    // upsertJobScheduler is the current API — a stable scheduler id means calling this
    // again on every app restart updates the schedule in place instead of creating duplicates,
    // which is exactly the idempotent behavior the old { repeat, jobId } pattern was going for
    await this.queue.upsertJobScheduler(
      'weekly-summary-report', // stable scheduler id
      { pattern: '0 8 * * 1' }, // every Monday 8am
      {
        name: 'weekly-summary',
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: 20,
          removeOnFail: 50,
        },
      },
    );
  }
}
