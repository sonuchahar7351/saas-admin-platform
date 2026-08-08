import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProductsRepository {
  constructor(private prisma: PrismaService) {}

  findByCampaign(campaignId: string, onlyActive = false) {
    return this.prisma.product.findMany({
      where: { campaignId, ...(onlyActive && { isActive: true }) },
      orderBy: { priority: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.product.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}
