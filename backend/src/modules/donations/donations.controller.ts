import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Headers,
  HttpCode,
  BadRequestException,
  UseGuards,
  Query,
  Param,
} from '@nestjs/common';
import type { Request } from 'express';
import { DonationsService } from './donations.service';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { QueryDonationsDto } from './dto/query-donations.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { OptionalCustomerAuthGuard } from '../../common/gaurds/optional-customer-auth.guard';
import { CreateDonationDto } from './dto/create-donation-order.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';

@Controller('donations')
export class DonationsController {
  constructor(private service: DonationsService) {}

  @Public()
  @UseGuards(OptionalCustomerAuthGuard)
  @Post('create-order')
  createOrder(@Body() dto: CreateDonationDto, @Req() req: any) {
    const authenticatedCustomerId = req.user?.customerId || null;
    return this.service.createOrder(dto, authenticatedCustomerId);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('my-donations')
  getMyDonations(@Req() req: any) {
    return this.service.getMyDonations(req.user.customerId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;

    if (!rawBody || !signature)
      throw new BadRequestException('Missing signature or body');
    if (!this.service.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }
    await this.service.handleWebhookEvent(JSON.parse(rawBody.toString()));
    return { received: true };
  }

  @Public()
  @Post('verify')
  @HttpCode(200)
  async verifyPayment(@Body() dto: VerifyDonationDto) {
    return this.service.verifyPayment(dto);
  }

  @RequirePermission('donations', 'read')
  @Get()
  findAllAdmin(@Query() query: QueryDonationsDto) {
    return this.service.findAllAdmin(query);
  }

  @Public()
  @Get('public/:id/summary')
  getPublicSummary(@Param('id') id: string) {
    return this.service.getPublicSummary(id);
  }

  @Public()
  @Get('public/campaign/:campaignId/donors')
  getCampaignDonors(@Param('campaignId') campaignId: string) {
    return this.service.getCampaignDonors(campaignId);
  }

  @RequirePermission('donations', 'read')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findByIdAdmin(id);
  }

  @Roles('SUPER_ADMIN') // matches your spec: refund is Super Admin only, Admin explicitly cannot
  @Post(':id/refund')
  refund(@Param('id') id: string) {
    return this.service.refund(id);
  }
}
