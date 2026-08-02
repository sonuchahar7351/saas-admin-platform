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
import { PaymentsService } from './payments.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsNumber, Min } from 'class-validator';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';

class CreateOrderDto {
  @IsNumber()
  @Min(1)
  amount!: number; // in rupees
  planName!: string;
}

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post('create-order')
  @UseGuards(CustomerJwtAuthGuard)
  createOrder(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.paymentsService.createOrder(
      req.user.customerId,
      dto.amount,
      dto.planName,
    );
  }
  @Get('my-payments')
  getMyPayments(@CurrentUser() user: any) {
    return this.paymentsService.getUserPayments(user.userId);
  }

  @Public() // Razorpay calls this directly — no user JWT attached
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: Request,
    @Headers('x-razorpay-signature') signature: string,
  ) {
    const rawBody = (req as any).rawBody;
    if (!rawBody || !signature) {
      throw new BadRequestException('Missing signature or body');
    }

    const isValid = this.paymentsService.verifyWebhookSignature(
      rawBody,
      signature,
    );
    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.paymentsService.handleWebhookEvent(
      JSON.parse(rawBody.toString()),
    );
    return { received: true };
  }
}
