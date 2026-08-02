import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { CustomerLoginDto } from './dto/login.dto';

@Injectable()
export class CustomerAuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });
    if (existing)
      throw new ConflictException('An account with this email already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const customer = await this.prisma.customer.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });
    return this.issueTokens(customer);
  }

  async login(dto: CustomerLoginDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { email: dto.email },
    });
    if (!customer || !customer.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, customer.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.issueTokens(customer);
  }

  private async issueTokens(customer: {
    id: string;
    email: string;
    name: string;
  }) {
    const payload = {
      sub: customer.id,
      email: customer.email,
      type: 'customer',
    };
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.CUSTOMER_JWT_ACCESS_SECRET,
      expiresIn: parseInt(process.env.JWT_ACCESS_EXPIRY!, 10),
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.CUSTOMER_JWT_REFRESH_SECRET,
      expiresIn: parseInt(process.env.JWT_REFRESH_EXPIRY!, 10),
    });

    await this.prisma.customerRefreshToken.create({
      data: {
        token: refreshToken,
        customerId: customer.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      customer: { id: customer.id, email: customer.email, name: customer.name },
    };
  }

  async refresh(oldToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(oldToken, {
        secret: process.env.CUSTOMER_JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.customerRefreshToken.findUnique({
      where: { token: oldToken },
    });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    await this.prisma.customerRefreshToken.delete({ where: { id: stored.id } });

    const customer = await this.prisma.customer.findUnique({
      where: { id: payload.sub },
    });
    if (!customer) throw new UnauthorizedException('Account not found');

    return this.issueTokens(customer);
  }

  async logout(refreshToken: string) {
    await this.prisma.customerRefreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }
}
