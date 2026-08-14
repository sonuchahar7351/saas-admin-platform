import { Module } from '@nestjs/common';
import { EightyGController } from './eighty-g.controller';
import { EightyGService } from './eighty-g.service';
import { EightyGRepository } from './eighty-g.repository';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { MediaModule } from '../media/media.module';
import { EmailService } from '../customer-auth/email.service';

@Module({
  imports: [CustomerAuthModule, MediaModule], // CustomerAuthModule for EmailService, MediaModule for S3Service
  controllers: [EightyGController],
  providers: [EightyGService, EightyGRepository, EmailService],
})
export class EightyGModule {}
