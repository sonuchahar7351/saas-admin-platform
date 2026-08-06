import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CategoriesRepository {
  constructor(private prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.category.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  create(data: { name: string; imageId?: string }) {
    return this.prisma.category.create({ data });
  }

  update(
    id: string,
    data: Partial<{ name: string; imageId: string; isActive: boolean }>,
  ) {
    return this.prisma.category.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  countCampaigns(id: string) {
    return this.prisma.campaign.count({ where: { categoryId: id } });
  }
}
