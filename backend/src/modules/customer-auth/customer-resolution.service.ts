import { Injectable, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CustomerResolutionService {
  constructor(private prisma: PrismaService) {}

  // shared by Donations and Recurring Donations — resolves to a customer id,
  // creating a guest account only if the email is genuinely new
  async resolveCustomerId(
    authenticatedCustomerId: string | null,
    email: string,
    name: string,
    guestPassword?: string,
  ): Promise<string> {
    if (authenticatedCustomerId) return authenticatedCustomerId;

    const existing = await this.prisma.customer.findUnique({
      where: { email },
    });
    if (existing) return existing.id;

    if (!guestPassword) {
      throw new BadRequestException(
        'A password is required to create a new account.',
      );
    }
    const hashed = await bcrypt.hash(guestPassword, 10);
    const created = await this.prisma.customer.create({
      data: { name, email, password: hashed },
    });
    return created.id;
  }
}
