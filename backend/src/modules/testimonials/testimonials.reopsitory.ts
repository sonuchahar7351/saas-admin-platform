import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestimonialsRepository {
  constructor(private prisma: PrismaService) {}

  findAllActive(limit: number) {
    return this.prisma.testimonial.findMany({
      where: { isActive: true },
      include: { campaign: { select: { title: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  findByCampaign(campaignId: string, onlyActive = false) {
    return this.prisma.testimonial.findMany({
      where: { campaignId, ...(onlyActive && { isActive: true }) },
      orderBy: { createdAt: 'desc' },
    });
  }
  findById(id: string) {
    return this.prisma.testimonial.findUnique({ where: { id } });
  }
  create(data: any) {
    return this.prisma.testimonial.create({ data });
  }
  update(id: string, data: any) {
    return this.prisma.testimonial.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.testimonial.delete({ where: { id } });
  }
}
