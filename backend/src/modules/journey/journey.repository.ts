import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JourneyRepository {
  constructor(private prisma: PrismaService) {}

  findByCampaign(campaignId: string) {
    return this.prisma.campaignJourney.findMany({
      where: { campaignId },
      orderBy: { order: 'asc' },
    });
  }
  findById(id: string) {
    return this.prisma.campaignJourney.findUnique({ where: { id } });
  }
  create(data: any) {
    return this.prisma.campaignJourney.create({ data });
  }
  update(id: string, data: any) {
    return this.prisma.campaignJourney.update({ where: { id }, data });
  }
  delete(id: string) {
    return this.prisma.campaignJourney.delete({ where: { id } });
  }
}
