import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmailQueueService } from './email-queue.service';
import { EmailProcessor } from './email.processor';
import { EmailModule } from '../../modules/email/email.module'; // was CustomerAuthModule

@Module({
  imports: [BullModule.registerQueue({ name: 'email' }), EmailModule],
  providers: [EmailQueueService, EmailProcessor],
  exports: [EmailQueueService],
})
export class EmailQueueModule {}
