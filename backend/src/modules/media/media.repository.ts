import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MediaRepository {
  constructor(private prisma: PrismaService) {}

  create(data: {
    url: string;
    key: string;
    category: any;
    tags: string[];
    uploadedById: string;
  }) {
    return this.prisma.media.create({ data });
  }

  findById(id: string) {
    return this.prisma.media.findUnique({ where: { id } });
  }

  findAll(category?: string, search?: string) {
    return this.prisma.media.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(search && {
          OR: [
            { key: { contains: search, mode: 'insensitive' } },
            { tags: { has: search } },
          ],
        }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findByIds(ids: string[]) {
    return this.prisma.media.findMany({ where: { id: { in: ids } } });
  }

  deleteMany(ids: string[]) {
    return this.prisma.media.deleteMany({ where: { id: { in: ids } } });
  }

  delete(id: string) {
    return this.prisma.media.delete({ where: { id } });
  }
}
