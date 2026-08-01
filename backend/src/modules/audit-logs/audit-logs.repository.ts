import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogsRepository {
  constructor(private prisma: PrismaService) {}

  findAll(filters: {
    userId?: string;
    resource?: string;
    page: number;
    limit: number;
  }) {
    const { userId, resource, page, limit } = filters;
    return this.prisma.auditLog.findMany({
      where: {
        ...(userId && { userId }),
        ...(resource && { resource }),
      },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });
  }

  count(filters: { userId?: string; resource?: string }) {
    return this.prisma.auditLog.count({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.resource && { resource: filters.resource }),
      },
    });
  }
}
