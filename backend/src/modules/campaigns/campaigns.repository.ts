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
}
