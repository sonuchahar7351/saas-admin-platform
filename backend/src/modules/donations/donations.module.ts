import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { ReceiptsQueueModule } from '../../queues/receipts/receipts-queue.module';

@Module({
  imports: [ReceiptsQueueModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsRepository],
})
export class DonationsModule {}
