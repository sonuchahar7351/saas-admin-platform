import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CampaignsRepository {
  constructor(private prisma: PrismaService) {}

  findAll(filters: { status?: string; categoryId?: string }) {
    return this.prisma.campaign.findMany({
      where: {
        ...(filters.status && { status: filters.status as any }),
        ...(filters.categoryId && { categoryId: filters.categoryId }),
        isMorph: false,
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
      isMorph: false,
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
      isMorph: false,
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

  findRawById(id: string) {
    return this.prisma.campaign.findUnique({ where: { id } });
  }

  findBySlugWithParent(slug: string) {
    return this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        category: true,
        ngo: true,
        parent: {
          select: {
            goalAmount: true,
            raisedAmount: true,
            expiryDate: true,
            status: true,
          },
        },
      },
    });
  }

  findMorphById(id: string) {
    return this.prisma.campaign.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
            goalAmount: true,
            raisedAmount: true,
            expiryDate: true,
            status: true,
          },
        },
        category: true,
        ngo: true,
      },
    });
  }

  // deep-copies content into a new Morph row, in one transaction — all or nothing
  async createMorphFromParent(
    parent: any,
    title: string,
    slug: string,
    createdById: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const morph = await tx.campaign.create({
        data: {
          title,
          slug,
          ngoId: parent.ngoId,
          categoryId: parent.categoryId,
          shortDescription: parent.shortDescription,
          story: parent.story,
          cardImageId: parent.cardImageId,
          bannerImageIds: parent.bannerImageIds,
          isAddress: parent.isAddress,
          donationPresets: parent.donationPresets,
          tipPresets: parent.tipPresets,
          goalAmount: parent.goalAmount,
          raisedAmount: 0,
          expiryDate: parent.expiryDate,
          status: 'CREATED',
          isMorph: true,
          parentCampaignId: parent.id,
          createdById,
        },
      });

      const [journeys, testimonials, updates, products] = await Promise.all([
        tx.campaignJourney.findMany({ where: { campaignId: parent.id } }),
        tx.testimonial.findMany({ where: { campaignId: parent.id } }),
        tx.update.findMany({
          where: { campaignId: parent.id },
          include: { glimpses: { include: { images: true } } },
        }),
        tx.product.findMany({ where: { campaignId: parent.id } }),
      ]);

      if (journeys.length) {
        await tx.campaignJourney.createMany({
          data: journeys.map((j) => ({
            campaignId: morph.id,
            imageId: j.imageId,
            title: j.title,
            description: j.description,
            order: j.order,
          })),
        });
      }
      if (testimonials.length) {
        await tx.testimonial.createMany({
          data: testimonials.map((t) => ({
            campaignId: morph.id,
            imageId: t.imageId,
            name: t.name,
            designation: t.designation,
            description: t.description,
            isActive: t.isActive,
          })),
        });
      }
      if (products.length) {
        await tx.product.createMany({
          data: products.map((p) => ({
            campaignId: morph.id,
            imageId: p.imageId,
            title: p.title,
            description: p.description,
            quantity: p.quantity,
            priority: p.priority,
            amount: p.amount,
            type: p.type,
            isActive: p.isActive,
          })),
        });
      }
      for (const u of updates) {
        const newUpdate = await tx.update.create({
          data: {
            campaignId: morph.id,
            title: u.title,
            content: u.content ?? Prisma.JsonNull,
          },
        });
        for (const g of u.glimpses) {
          await tx.glimpse.create({
            data: {
              updateId: newUpdate.id,
              order: g.order,
              images: {
                create: g.images.map((img) => ({
                  mediaId: img.mediaId,
                  order: img.order,
                })),
              },
            },
          });
        }
      }

      return morph;
    });
  }

  getSourceBreakdown(parentCampaignId: string) {
    return this.prisma.donation.groupBy({
      by: ['sourceCampaignId'],
      where: { campaignId: parentCampaignId, status: 'PAID' },
      _sum: { amount: true },
      _count: { id: true },
    });
  }

  cascadeCompleteMorphs(parentCampaignId: string) {
    return this.prisma.campaign.updateMany({
      where: {
        parentCampaignId,
        isMorph: true,
        status: { in: ['ACTIVE', 'CREATED'] },
      },
      data: { status: 'COMPLETED' },
    });
  }

  findMorphs(parentCampaignId?: string) {
    return this.prisma.campaign.findMany({
      where: { isMorph: true, ...(parentCampaignId && { parentCampaignId }) },
      orderBy: { createdAt: 'desc' },
      include: {
        parent: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            goalAmount: true,
            raisedAmount: true,
            expiryDate: true,
          },
        },
      },
    });
  }

  async updateMorphSlug(id: string, newSlug: string) {
    const exists = await this.prisma.campaign.findUnique({
      where: { slug: newSlug },
    });
    if (exists) return null; // signals "slug taken" to the service layer
    return this.prisma.campaign.update({
      where: { id },
      data: { slug: newSlug },
    });
  }
}
