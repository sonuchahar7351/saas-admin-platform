import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { MediaRepository } from '../media/media.repository';
import { CampaignStatusService } from './campaign-status.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'campaign-status' }), // registers the queue connection for this module too
  ],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignsRepository,
    MediaRepository,
    CampaignStatusService,
  ],
  exports: [CampaignsService, CampaignStatusService],
})
export class CampaignsModule {}
