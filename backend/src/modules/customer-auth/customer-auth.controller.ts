import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CustomerAuthService } from './customer-auth.service';
import { RegisterDto } from './dto/register.dto';
import { CustomerLoginDto } from './dto/login.dto';
import { CustomerJwtAuthGuard } from '../../common/gaurds/customer-jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ForgotPasswordDto, ResetPasswordDto } from './dto/forgot.dto';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(private authService: CustomerAuthService) {}

  private setCookie(res: Response, refreshToken: string) {
    res.cookie('customerRefreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, customer } =
      await this.authService.register(dto);
    this.setCookie(res, refreshToken);
    return { accessToken, customer };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: CustomerLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, refreshToken, customer } =
      await this.authService.login(dto);
    this.setCookie(res, refreshToken);
    return { accessToken, customer };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const old = req.cookies?.customerRefreshToken;
    const { accessToken, refreshToken } = await this.authService.refresh(old);
    this.setCookie(res, refreshToken);
    return { accessToken };
  }

  @Public()
  @Post('logout')
  @UseGuards(CustomerJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies?.customerRefreshToken;
    if (token) await this.authService.logout(token);
    res.clearCookie('customerRefreshToken');
    return { message: 'Logged out' };
  }

  @Public()
  @Get('me')
  @UseGuards(CustomerJwtAuthGuard)
  getMe(@CurrentUser() user: any) {
    return user; // { customerId, email }
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
