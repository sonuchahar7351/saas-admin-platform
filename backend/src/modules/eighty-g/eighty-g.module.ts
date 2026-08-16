import { Module } from '@nestjs/common';
import { EightyGController } from './eighty-g.controller';
import { EightyGService } from './eighty-g.service';
import { EightyGRepository } from './eighty-g.repository';
import { MediaModule } from '../media/media.module';
import { EmailQueueModule } from '../../queues/email/email-queue.module';

@Module({
  imports: [MediaModule, EmailQueueModule],
  controllers: [EightyGController],
  providers: [EightyGService, EightyGRepository],
})
export class EightyGModule {}
