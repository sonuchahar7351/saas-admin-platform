import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  Res,
  Headers,
  HttpCode,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RecurringDonationsService } from './recurring-donations.service';
import { SetupRecurringDto } from './dto/setup-recurring.dto';
import { CampaignsService } from '../campaigns/campaigns.service';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { OptionalCustomerAuthGuard } from '../../common/gaurds/optional-customer-auth.guard';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';

@Controller('recurring-donations')
export class RecurringDonationsController {
  constructor(
    private service: RecurringDonationsService,
    private campaignsService: CampaignsService,
  ) {}

  @Public()
  @UseGuards(OptionalCustomerAuthGuard)
  @Post('setup')
  async setup(@Body() dto: SetupRecurringDto, @Req() req: any) {
    const campaign = await this.campaignsService.findById(dto.campaignId);
    return this.service.setup(
      dto,
      req.user?.customerId || null,
      campaign.title,
    );
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('my')
  getMine(@Req() req: any) {
    return this.service.getMyRecurring(req.user.customerId);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Patch(':id/cancel')
  cancel(@Param('id') id: string, @Req() req: any) {
    return this.service.cancel(id, req.user.customerId);
  }

  @RequirePermission('recurringDonations', 'read')
  @Get()
  findAllAdmin(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAllAdmin({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      status,
    });
  }

  @RequirePermission('recurringDonations', 'write')
  @Patch(':id/pause')
  pause(@Param('id') id: string) {
    return this.service.adminPause(id);
  }

  @RequirePermission('recurringDonations', 'write')
  @Patch(':id/resume')
  resume(@Param('id') id: string) {
    return this.service.adminResume(id);
  }

  @RequirePermission('recurringDonations', 'write')
  @Patch(':id/admin-cancel')
  adminCancel(@Param('id') id: string) {
    return this.service.adminCancel(id);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    if (!rawBody || !signature)
      throw new BadRequestException('Missing signature or body');
    if (!this.service.verifyWebhookSignature(rawBody, signature))
      throw new BadRequestException('Invalid signature');
    await this.service.handleWebhookEvent(JSON.parse(rawBody.toString()));
    return { received: true };
  }
}
