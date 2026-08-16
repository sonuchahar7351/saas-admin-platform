import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ReceiptsQueueService } from './receipts-queue.service';
import { ReceiptsProcessor } from './receipts.processor';
import { ReceiptsModule } from '../../modules/receipts/receipts.module';

@Module({
  imports: [BullModule.registerQueue({ name: 'receipts' }), ReceiptsModule],
  providers: [ReceiptsQueueService, ReceiptsProcessor],
  exports: [ReceiptsQueueService],
})
export class ReceiptsQueueModule {}
