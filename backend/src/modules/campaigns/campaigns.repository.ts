import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CampaignsRepository {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { status?: string; categoryId?: string }) {
    return this.prisma.campaign.findMany({
      where: {
        ...(filters.status && { status: filters.status as any }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
      },
      include: { category: true, ngo: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllPaginated(query: {
    status?: string;
    categoryId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const { status, categoryId, search, page, limit } = query;
    const where: any = {
      ...(status && { status }),
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { ngo: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };
    return Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, ngo: true },
      }),
      this.prisma.campaign.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: { category: true, ngo: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.campaign.findUnique({
      where: { slug },
      include: { category: true, ngo: true },
    });
  }

  slugExists(slug: string) {
    return this.prisma.campaign.count({ where: { slug } }).then((c) => c > 0);
  }

  create(data: any) {
    return this.prisma.campaign.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.campaign.update({ where: { id }, data });
  }

  updateStatus(id: string, status: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { status: status as any },
    });
  }

  softDelete(id: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { status: 'DELETED' },
    });
  }

  findPublicPaginated(query: {
    categoryId?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    page: number;
    limit: number;
  }) {
    const { categoryId, search, status, sortBy, page, limit } = query;

    const where: any = {
      status: status ? status : { in: ['ACTIVE', 'COMPLETED'] }, // Explore shows both by default; homepage narrows to ACTIVE
      ...(categoryId && { categoryId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
          { ngo: { name: { contains: search, mode: 'insensitive' } } },
          { category: { name: { contains: search, mode: 'insensitive' } } },
        ],
      }),
    };

    const orderBy =
      sortBy === 'oldest'
        ? { createdAt: 'asc' as const }
        : sortBy === 'mostFunded'
          ? { raisedAmount: 'desc' as const }
          : sortBy === 'leastFunded'
            ? { raisedAmount: 'asc' as const }
            : sortBy === 'endingSoon'
              ? { expiryDate: 'asc' as const }
              : { createdAt: 'desc' as const }; // 'newest' or default

    return Promise.all([
      this.prisma.campaign.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true, ngo: true },
      }),
      this.prisma.campaign.count({ where }),
    ]);
  }
}
