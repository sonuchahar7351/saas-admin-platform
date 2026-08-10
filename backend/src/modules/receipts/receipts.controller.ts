import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ReceiptsService } from './receipts.service';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';

@Controller('receipts')
export class ReceiptsController {
  constructor(private service: ReceiptsService) {}

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('donation/:donationId')
  getByDonation(@Param('donationId') donationId: string, @Req() req: any) {
    return this.service.getByDonationId(donationId, req.user.customerId);
  }
}
