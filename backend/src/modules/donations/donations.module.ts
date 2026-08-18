import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { ReceiptsQueueModule } from '../../queues/receipts/receipts-queue.module';
import { FraudDetectionService } from './fraud.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [ReceiptsQueueModule, AiModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsRepository, FraudDetectionService],
})
export class DonationsModule {}
