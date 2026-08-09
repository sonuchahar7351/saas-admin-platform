import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TestimonialsRepository {
  constructor(private prisma: PrismaService) {}

  findByCampaign(campaignId: string) {
    return this.prisma.testimonial.findMany({
      where: { campaignId },
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
