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
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { DonationsService } from './donations.service';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { QueryDonationsDto } from './dto/query-donations.dto';
import { Roles } from '../../common/decorators/role.decorator';
import { OptionalCustomerAuthGuard } from '../../common/gaurds/optional-customer-auth.guard';
import { CreateDonationDto } from './dto/create-donation-order.dto';
import { VerifyDonationDto } from './dto/verify-donation.dto';
import { ExportDonationsDto } from './dto/export-donations.dto';
import { Throttle } from '@nestjs/throttler';

@Controller('donations')
export class DonationsController {
  constructor(private service: DonationsService) {}

  @RequirePermission('donations', 'export')
  @Get('export')
  async exportDonations(
    @Query() dto: ExportDonationsDto,
    @Res() res: Response,
  ) {
    const buffer = await this.service.exportDonations(dto);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="donations-export-${Date.now()}.xlsx"`,
    });
    res.send(buffer);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @UseGuards(OptionalCustomerAuthGuard)
  @Post('create-order')
  createOrder(@Body() dto: CreateDonationDto, @Req() req: any) {
    const authenticatedCustomerId = req.user?.customerId || null;
    return this.service.createOrder(dto, authenticatedCustomerId);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('my-donations')
  getMyDonations(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.getMyDonations(
      req.user.customerId,
      page ? Number(page) : undefined,
      limit ? Number(limit) : undefined,
    );
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('my-donations/:id')
  getMyDonationDetail(@Req() req: any, @Param('id') id: string) {
    return this.service.getMyDonationDetail(req.user.customerId, id);
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
  getCampaignDonors(
    @Param('campaignId') campaignId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.service.getCampaignDonors(
      campaignId,
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
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
