import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { ReceiptsQueueModule } from '../../queues/receipts/receipts-queue.module';
import { FraudDetectionService } from './fraud.service';
import { AiModule } from '../ai/ai.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [ReceiptsQueueModule, AiModule, CampaignsModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsRepository, FraudDetectionService],
})
export class DonationsModule {}
