import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class CustomerJwtStrategy extends PassportStrategy(
  Strategy,
  'customer-jwt',
) {
  constructor(private prisma: PrismaService) {
    const secret = process.env.CUSTOMER_JWT_ACCESS_SECRET;
    if (!secret) throw new Error('CUSTOMER_JWT_ACCESS_SECRET is not defined');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true },
    });
    if (!customer) return null;
    return { ...customer, customerId: customer?.id }; // customerId alias for controllers expecting it
  }
}
