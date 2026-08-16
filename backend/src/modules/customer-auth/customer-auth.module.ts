import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerJwtStrategy } from './strategies/customer-jwt.strategy';
import { CustomerResolutionService } from './customer-resolution.service';
import { EmailQueueModule } from '../../queues/email/email-queue.module';

@Module({
  imports: [PassportModule, JwtModule.register({}), EmailQueueModule],
  controllers: [CustomerAuthController],
  providers: [
    CustomerAuthService,
    CustomerJwtStrategy,
    CustomerResolutionService,
  ],
  exports: [CustomerResolutionService],
})
export class CustomerAuthModule {}
