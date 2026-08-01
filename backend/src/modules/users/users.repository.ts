import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(requestingUser: { userId: string; role: string }) {
    const where =
      requestingUser.role === 'ADMIN'
        ? { createdById: requestingUser.userId } // ownership filter
        : {}; // Super Admin / Sub Admin see all (permission check already passed)

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        role: true,
        createdAt: true,
      },
    });
  }

  create(data: {
    email: string;
    password: string;
    name: string;
    roleId: string;
    createdById: string;
  }) {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
