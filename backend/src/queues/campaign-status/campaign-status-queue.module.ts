import { Module, OnModuleInit } from '@nestjs/common';
import { BullModule, InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CampaignsModule } from '../../modules/campaigns/campaigns.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CampaignStatusProcessor } from './campaign-status.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'campaign-status' }),
    CampaignsModule,
    PrismaModule,
  ],
  providers: [CampaignStatusProcessor],
})
export class CampaignStatusQueueModule implements OnModuleInit {
  constructor(@InjectQueue('campaign-status') private queue: Queue) {}

  async onModuleInit() {
    await this.queue.upsertJobScheduler(
      'campaign-status-sweep',
      { pattern: '0 1 * * *' }, // daily at 1am — quiet hours, ahead of the 8am weekly report
      {
        name: 'sweep-campaigns',
        opts: { attempts: 3, removeOnComplete: 10, removeOnFail: 20 },
      },
    );
  }
}
