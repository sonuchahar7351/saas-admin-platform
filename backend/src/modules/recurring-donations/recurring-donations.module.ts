import { Module } from '@nestjs/common';
import { RecurringDonationsController } from './recurring-donations.controller';
import { RecurringDonationsService } from './recurring-donations.service';
import { RecurringDonationsRepository } from './recurring-donations.repository';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { CampaignsModule } from '../campaigns/campaigns.module';

@Module({
  imports: [CustomerAuthModule, CampaignsModule],
  controllers: [RecurringDonationsController],
  providers: [RecurringDonationsService, RecurringDonationsRepository],
})
export class RecurringDonationsModule {}
