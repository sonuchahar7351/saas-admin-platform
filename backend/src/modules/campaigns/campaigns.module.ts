import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { MediaRepository } from '../media/media.repository';
import { CampaignStatusService } from './campaign-status.service';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [BullModule.registerQueue({ name: 'campaign-status' })],
  controllers: [CampaignsController],
  providers: [
    CampaignsService,
    CampaignsRepository,
    MediaRepository,
    CampaignStatusService,
  ],
  exports: [CampaignsService, CampaignStatusService, CampaignsRepository],
})
export class CampaignsModule {}
