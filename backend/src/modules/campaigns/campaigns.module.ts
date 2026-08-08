import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { MediaRepository } from '../media/media.repository';

@Module({
  controllers: [CampaignsController],
  providers: [CampaignsService, CampaignsRepository, MediaRepository],
})
export class CampaignsModule {}
