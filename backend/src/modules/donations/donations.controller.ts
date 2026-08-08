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
} from '@nestjs/common';
import type { Request } from 'express';
import { DonationsService } from './donations.service';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';
import { CreateDonationOrderDto } from './dto/create-donation-order.dto';

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
}
