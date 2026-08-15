import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { EmailService } from './email.service';
import { CustomerResolutionService } from './customer-resolution.service';

@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    EmailService,
    CustomerResolutionService,
  ],
  exports: [CustomerResolutionService],
})
export class CustomerAuthModule {}
