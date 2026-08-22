import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CampaignsRepository } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { MediaRepository } from '../media/media.repository';
import { FeatureCampaignDto } from './dto/feature-campaign.dto';
import { QueryPublicCampaignsDto } from './dto/query-public-campaigns.dto';
import { CacheService } from '../../common/cache/cache.service';
import { CampaignStatusService } from './campaign-status.service';
import { CreateMorphCampaignDto } from './dto/create-morph-campaign.dto';

// allowed forward transitions only — no jumping straight to COMPLETED from CREATED, etc.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ACTIVE', 'DELETED', 'COMPLETED'],
  ACTIVE: ['COMPLETED', 'DELETED', 'CREATED'],
  COMPLETED: ['DELETED', 'ACTIVE'],
  DELETED: ['ACTIVE'],
};

@Injectable()
export class CampaignsService {
  constructor(
    private repo: CampaignsRepository,
    private mediaRepo: MediaRepository,
    private cache: CacheService,
    private statusService: CampaignStatusService,
  ) {}

  async setFeatured(id: string, dto: FeatureCampaignDto) {
    const campaign = await this.findById(id);
    if (dto.isFeatured && !dto.featureImageDesktopId) {
      throw new BadRequestException(
        'A desktop feature image is required to feature a campaign.',
      );
    }
    const updated = await this.repo.update(id, {
      isFeatured: dto.isFeatured,
      featuredOrder: dto.isFeatured ? (dto.featuredOrder ?? 0) : null,
      featureImageDesktopId: dto.isFeatured ? dto.featureImageDesktopId : null,
      featureImageMobileId: dto.isFeatured ? dto.featureImageMobileId : null,
    });
    await this.invalidateCampaignCaches(campaign.slug);
    return updated;
  }

  async findFeatured() {
    return this.cache.getOrSet('cache:campaigns:featured', 60, async () => {
      const campaigns = await this.repo.findAll({
        status: 'ACTIVE',
      });
      const featured = campaigns
        .filter((c) => c.isFeatured)
        .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
      return this.attachImageUrls(featured);
    });
  }

  private async attachImageUrls(campaigns: any[]) {
    const cardIds = campaigns.map((c) => c.cardImageId).filter(Boolean);
    const bannerIds = campaigns.flatMap((c) => c.bannerImageIds || []);
    const featureDesktopIds = campaigns
      .map((c) => c.featureImageDesktopId)
      .filter(Boolean);
    const featureMobileIds = campaigns
      .map((c) => c.featureImageMobileId)
      .filter(Boolean);

    const allIds = [
      ...new Set([
        ...cardIds,
        ...bannerIds,
        ...featureDesktopIds,
        ...featureMobileIds,
      ]),
    ];

    if (allIds.length === 0) {
      return campaigns.map((c) => ({
        ...c,
        cardImageUrl: null,
        bannerImageUrls: [],
        featureImageDesktopUrl: null,
        featureImageMobileUrl: null,
      }));
    }

    const mediaItems = await this.mediaRepo.findByIds(allIds);
    const urlById = new Map(mediaItems.map((m) => [m.id, m.url]));

    return campaigns.map((c) => ({
      ...c,
      cardImageUrl: c.cardImageId ? urlById.get(c.cardImageId) || null : null,
      bannerImageUrls: (c.bannerImageIds || [])
        .map((id: string) => urlById.get(id))
        .filter(Boolean),
      featureImageDesktopUrl: c.featureImageDesktopId
        ? urlById.get(c.featureImageDesktopId) || null
        : null,
      featureImageMobileUrl: c.featureImageMobileId
        ? urlById.get(c.featureImageMobileId) || null
        : null,
    }));
  }

  async findPublicBySlug(slug: string) {
    const key = `cache:campaign:slug:${slug}`;
    return this.cache.getOrSet(key, 60, async () => {
      const campaign = await this.repo.findBySlugWithParent(slug);

      if (
        !campaign ||
        (campaign.status !== 'ACTIVE' && campaign.status !== 'COMPLETED')
      )
        return null;
      const [withImage] = await this.attachImageUrls([campaign]);

      // const overlaid = await this.overlayFinancials(withImage);
      return await this.withStatusEvaluation(withImage);
    });
  }

  async findAll(filters: { status?: string; categoryId?: string }) {
    const campiangs = await this.repo.findAll(filters);
    return this.attachImageUrls(campiangs);
  }

  async findAllAdmin(query: {
    status?: string;
    categoryId?: string;
    search?: string;
    page: number;
    limit: number;
  }) {
    const [data, total] = await this.repo.findAllPaginated(query);
    const withImages = await this.attachImageUrls(data);

    const withStatus = withImages.map((campaign) =>
      this.overlayFinancials(campaign),
    );

    return {
      data: withStatus,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async findById(id: string) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    const [withImages] = await this.attachImageUrls([campaign]);
    const overlaid = this.overlayFinancials(withImages);
    return overlaid;
  }

  private validatePresets(donationPresets: any[], tipPresets: any[]) {
    if (donationPresets?.length !== 3) {
      throw new BadRequestException(
        'Exactly 3 donation amount presets are required',
      );
    }
    if (donationPresets?.filter((p) => p.isDefault).length !== 1) {
      throw new BadRequestException(
        'Exactly one donation preset must be marked default',
      );
    }
    if (tipPresets?.length !== 3) {
      throw new BadRequestException(
        'Exactly 3 tip percentage presets are required',
      );
    }
    if (tipPresets?.filter((p) => p.isDefault).length !== 1) {
      throw new BadRequestException(
        'Exactly one tip preset must be marked default',
      );
    }
  }

  private slugify(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  private async generateUniqueSlug(
    title: string,
    providedSlug?: string,
  ): Promise<string> {
    const base = providedSlug
      ? this.slugify(providedSlug)
      : this.slugify(title);
    let slug = base;
    let attempt = 0;
    while (await this.repo.slugExists(slug)) {
      attempt++;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
      if (attempt > 5)
        throw new ConflictException(
          'Could not generate a unique slug, try a different title',
        );
    }
    return slug;
  }

  async create(dto: CreateCampaignDto, createdById: string) {
    this.validatePresets(dto.donationPresets, dto.tipPresets);
    const slug = await this.generateUniqueSlug(dto.title, dto.slug);

    const campaign = await this.repo.create({
      title: dto.title,
      slug,
      ngoId: dto.ngoId,
      categoryId: dto.categoryId,
      goalAmount: Math.round(dto.goalAmount * 100), // rupees -> paise
      shortDescription: dto.shortDescription,
      cardImageId: dto.cardImageId,
      story: dto.story,
      expiryDate: new Date(dto.expiryDate),
      donationPresets: dto.donationPresets,
      tipPresets: dto.tipPresets,
      status: 'CREATED', // always, regardless of what the client might try to send
      createdById,
      isAddress: dto.isAddress,
    });

    await this.invalidateCampaignCaches(campaign.slug);
    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const existing = await this.findById(id);

    if (
      existing.isMorph &&
      (dto.goalAmount !== undefined || (dto as any).expiryDate !== undefined)
    ) {
      throw new BadRequestException(
        'Goal amount and expiry date are managed by the parent campaign for Morph Campaigns.',
      );
    }

    if (dto.donationPresets || dto.tipPresets) {
      this.validatePresets(
        dto.donationPresets ?? (existing.donationPresets as any[]),
        dto.tipPresets ?? (existing.tipPresets as any[]),
      );
    }

    const data: any = { ...dto };
    if (dto.goalAmount) data.goalAmount = Math.round(dto.goalAmount * 100);
    if (dto.expiryDate) data.expiryDate = new Date(dto.expiryDate);

    const updated = await this.repo.update(id, data);
    await this.invalidateCampaignCaches(existing.slug);
    return updated;
  }

  async changeStatus(id: string, newStatus: string) {
    const campaign = await this.repo.findRawById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    const allowed = ALLOWED_TRANSITIONS[campaign.status];
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${campaign.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }

    if (campaign.status === 'COMPLETED' && newStatus === 'ACTIVE') {
      if (campaign.isMorph) {
        const parent = await this.repo.findRawById(campaign.parentCampaignId!);
        if (!parent) throw new NotFoundException('Parent campaign not found');
        this.statusService.assertCanReactivate({
          status: 'COMPLETED',
          goalAmount: parent.goalAmount,
          raisedAmount: parent.raisedAmount,
          expiryDate: parent.expiryDate,
        });
      } else {
        this.statusService.assertCanReactivate({
          status: campaign.status,
          goalAmount: campaign.goalAmount,
          raisedAmount: campaign.raisedAmount,
          expiryDate: campaign.expiryDate,
        });
      }
    }

    const updated = await this.repo.updateStatus(id, newStatus);
    await this.invalidateCampaignCaches(campaign.slug);
    return updated;
  }

  async duplicate(id: string, createdById: string) {
    const original = await this.findById(id);
    const newTitle = `${original.title} (Copy)`;
    const slug = await this.generateUniqueSlug(newTitle);

    const created = await this.repo.create({
      title: newTitle,
      slug,
      ngoId: original.ngoId,
      categoryId: original.categoryId,
      goalAmount: original.goalAmount,
      shortDescription: original.shortDescription,
      cardImageId: original.cardImageId,
      story: original.story,
      expiryDate: original.expiryDate,
      donationPresets: original.donationPresets,
      tipPresets: original.tipPresets,
      status: 'CREATED',
      createdById,
    });

    await this.invalidateCampaignCaches(created.slug);
    return created;
  }

  async delete(id: string) {
    const campaign = await this.findById(id);
    const result = await this.repo.softDelete(id);
    await this.invalidateCampaignCaches(campaign.slug);
    return result;
  }

  async findPublicPaginated(query: QueryPublicCampaignsDto) {
    const key = `cache:campaigns:public:${JSON.stringify(query)}`;
    return this.cache.getOrSet(key, 60, async () => {
      const [data, total] = await this.repo.findPublicPaginated(query);
      const withImages = await this.attachImageUrls(data);

      const withStatus = withImages.map((campaign) =>
        this.overlayFinancials(campaign),
      );

      return {
        data: withStatus,
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      };
    });
  }

  private async invalidateCampaignCaches(slug?: string) {
    await this.cache.delByPrefix('cache:campaigns:public:');
    await this.cache.del('cache:campaigns:featured');
    if (slug) await this.cache.del(`cache:campaign:slug:${slug}`);
  }

  private overlayFinancials(campaign: any) {
    if (!campaign.isMorph || !campaign.parent) return campaign;
    return {
      ...campaign,
      goalAmount: campaign.parent.goalAmount,
      raisedAmount: campaign.parent.raisedAmount,
      expiryDate: campaign.parent.expiryDate,
      status: campaign.parent.status, // whether donations can happen — always the parent's call
    };
  }

  private async withStatusEvaluation(campaign: any) {
    if (campaign.isMorph && campaign.parent) {
      const parentEvaluation = this.statusService.evaluate({
        status: campaign.parent.status,
        goalAmount: campaign.parent.goalAmount,
        raisedAmount: campaign.parent.raisedAmount,
        expiryDate: campaign.parent.expiryDate,
      });

      return {
        ...campaign,
        goalAmount: campaign.parent.goalAmount, // shared pool numbers, for display
        raisedAmount: campaign.parent.raisedAmount,
        expiryDate: campaign.parent.expiryDate,
        parentStatus: campaign.parent.status, // NEW — informational, separate from the morph's own status
        statusEvaluation: {
          ...parentEvaluation,
          // a morph can only actually accept donations if IT is published AND the shared pool is still open
          canAcceptDonations:
            campaign.status === 'ACTIVE' && parentEvaluation.canAcceptDonations,
        },
        // campaign.status is left completely untouched — this is the actual fix
      };
    }

    const evaluation = this.statusService.evaluate({
      status: campaign.status,
      goalAmount: campaign.goalAmount,
      raisedAmount: campaign.raisedAmount,
      expiryDate: campaign.expiryDate,
    });
    return { ...campaign, statusEvaluation: evaluation };
  }

  async createMorph(dto: CreateMorphCampaignDto, createdById: string) {
    const parent = await this.repo.findRawById(dto.parentCampaignId);
    if (!parent) throw new NotFoundException('Parent campaign not found');
    if (parent.isMorph) {
      throw new ConflictException(
        'A Morph Campaign cannot be used as the parent campaign. Please select a normal campaign.',
      );
    }

    const slug = await this.generateUniqueSlug(dto.title);

    return this.repo.createMorphFromParent(
      parent,
      dto.title,
      slug,
      createdById,
    );
  }

  async findMorphs(parentCampaignId?: string) {
    const morphs = await this.repo.findMorphs(parentCampaignId);
    return this.attachImageUrls(morphs); // reuses your existing batch image resolver, unchanged
  }

  async findMorphById(id: string) {
    const morph = await this.repo.findMorphById(id);
    if (!morph || !morph.isMorph)
      throw new NotFoundException('Morph campaign not found');

    const [withImage] = await this.attachImageUrls([morph]);
    return this.withStatusEvaluation(withImage);
  }

  async getSourceBreakdown(parentCampaignId: string) {
    const rows = await this.repo.getSourceBreakdown(parentCampaignId);
    const sourceIds = rows.map((r) => r.sourceCampaignId);
    const sources = await Promise.all(
      sourceIds.map((id) => this.repo.findRawById(id)),
    );
    const nameById = new Map(
      sources.filter(Boolean).map((s) => [s!.id, s!.title]),
    );

    return rows.map((r) => ({
      sourceCampaignId: r.sourceCampaignId,
      sourceTitle: nameById.get(r.sourceCampaignId) || 'Unknown',
      totalAmount: r._sum.amount || 0,
      donationCount: r._count.id,
    }));
  }

  async cascadeCompleteMorphsForParent(parentCampaignId: string) {
    const result = await this.repo.cascadeCompleteMorphs(parentCampaignId);
    if (result.count > 0) {
      await this.cache.delByPrefix('cache:campaign:slug:'); // any of those morphs' cached pages are now stale
    }
    return result;
  }

  async updateMorphSlug(id: string, newSlug: string) {
    const campaign = await this.repo.findRawById(id);
    if (!campaign || !campaign.isMorph)
      throw new NotFoundException('Morph campaign not found');

    const updated = await this.repo.updateMorphSlug(id, newSlug);
    if (!updated) throw new ConflictException('That slug is already in use.');

    await this.cache.del(`cache:campaign:slug:${campaign.slug}`); // old slug's cache
    await this.cache.del(`cache:campaign:slug:${newSlug}`); // just in case anything cached a "not found" there
    return updated;
  }
}
