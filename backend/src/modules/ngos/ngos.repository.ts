import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NgosRepository {
  constructor(private prisma: PrismaService) {}

  findAll(onlyActive = false) {
    return this.prisma.ngo.findMany({
      where: onlyActive ? { isActive: true } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.ngo.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.ngo.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.ngo.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.ngo.delete({ where: { id } });
  }

  countCampaigns(id: string) {
    return this.prisma.campaign.count({ where: { ngoId: id } });
  }
}
