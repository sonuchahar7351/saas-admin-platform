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
import { CreateDonationOrderDto } from './dto/create-donation-order.dto';
import { RequirePermission } from '../../common/decorators/permission.decorator';
import { QueryDonationsDto } from './dto/query-donations.dto';
import { Roles } from '../../common/decorators/role.decorator';

@Controller('donations')
export class DonationsController {
  constructor(private service: DonationsService) {}

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post('create-order')
  createOrder(@Body() dto: CreateDonationOrderDto, @Req() req: any) {
    return this.service.createOrder(req.user.customerId, dto);
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

  @RequirePermission('donations', 'read')
  @Get()
  findAllAdmin(@Query() query: QueryDonationsDto) {
    return this.service.findAllAdmin(query);
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
