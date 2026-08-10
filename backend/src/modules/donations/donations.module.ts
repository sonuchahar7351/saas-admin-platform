import { Module } from '@nestjs/common';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { DonationsRepository } from './donations.repository';
import { ReceiptsModule } from '../receipts/receipts.module';

@Module({
  imports: [ReceiptsModule],
  controllers: [DonationsController],
  providers: [DonationsService, DonationsRepository],
})
export class DonationsModule {}
