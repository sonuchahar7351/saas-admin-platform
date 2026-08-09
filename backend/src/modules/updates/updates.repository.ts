import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UpdatesRepository {
  constructor(private prisma: PrismaService) {}

  findByCampaign(campaignId: string) {
    return this.prisma.update.findMany({
      where: { campaignId },
      include: {
        glimpses: {
          orderBy: { order: 'asc' },
          include: { images: { orderBy: { order: 'asc' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.update.findUnique({
      where: { id },
      include: { glimpses: { include: { images: true } } },
    });
  }

  create(data: { campaignId: string; title: string; content: any }) {
    return this.prisma.update.create({ data });
  }

  update(id: string, data: any) {
    return this.prisma.update.update({ where: { id }, data });
  }

  delete(id: string) {
    return this.prisma.update.delete({ where: { id } }); // cascades to glimpses + glimpseImages via schema
  }

  // ---- Glimpses ----

  createGlimpse(updateId: string, order: number, mediaIds: string[]) {
    return this.prisma.glimpse.create({
      data: {
        updateId,
        order,
        images: {
          create: mediaIds.map((mediaId, i) => ({ mediaId, order: i })),
        },
      },
      include: { images: true },
    });
  }

  deleteGlimpse(id: string) {
    return this.prisma.glimpse.delete({ where: { id } });
  }

  findGlimpseById(id: string) {
    return this.prisma.glimpse.findUnique({
      where: { id },
      include: { images: true },
    });
  }

  addGlimpseImages(glimpseId: string, mediaIds: string[], startOrder: number) {
    return this.prisma.glimpseImage.createMany({
      data: mediaIds.map((mediaId, i) => ({
        glimpseId,
        mediaId,
        order: startOrder + i,
      })),
    });
  }

  removeGlimpseImage(id: string) {
    return this.prisma.glimpseImage.delete({ where: { id } });
  }
}
