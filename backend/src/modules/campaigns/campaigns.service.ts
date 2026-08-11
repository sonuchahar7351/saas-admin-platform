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

// allowed forward transitions only — no jumping straight to COMPLETED from CREATED, etc.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ACTIVE', 'DELETED'],
  ACTIVE: ['COMPLETED', 'DELETED'],
  COMPLETED: ['DELETED'],
  DELETED: ['ACTIVE'], // terminal state
};

@Injectable()
export class CampaignsService {
  constructor(
    private repo: CampaignsRepository,
    private mediaRepo: MediaRepository,
  ) {}

  async setFeatured(id: string, dto: FeatureCampaignDto) {
    const campaign = await this.findById(id);
    if (dto.isFeatured && !dto.featureImageDesktopId) {
      throw new BadRequestException(
        'A desktop feature image is required to feature a campaign.',
      );
    }
    return this.repo.update(id, {
      isFeatured: dto.isFeatured,
      featuredOrder: dto.isFeatured ? (dto.featuredOrder ?? 0) : null,
      featureImageDesktopId: dto.isFeatured ? dto.featureImageDesktopId : null,
      featureImageMobileId: dto.isFeatured ? dto.featureImageMobileId : null,
    });
  }

  async findFeatured() {
    const campaigns = await this.repo.findAll({ status: 'ACTIVE' });
    const featured = campaigns
      .filter((c) => c.isFeatured)
      .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
    return this.attachImageUrls(featured);
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
    const campaign = await this.repo.findBySlug(slug);
    if (
      !campaign ||
      (campaign.status !== 'ACTIVE' && campaign.status !== 'COMPLETED')
    ) {
      return null;
    }
    // const cardImage = campaign.cardImageId
    //   ? await this.mediaRepo.findById(campaign.cardImageId)
    //   : null;
    // return { ...campaign, cardImageUrl: cardImage?.url || null };
    return this.attachImageUrls([campaign]);
  }

  async findAll(filters: { status?: string; categoryId?: string }) {
    const campiangs = await this.repo.findAll(filters);
    return this.attachImageUrls(campiangs);
  }

  async findById(id: string) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    const [withImages] = await this.attachImageUrls([campaign]);
    return withImages;
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

    return this.repo.create({
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
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const existing = await this.findById(id);

    if (dto.donationPresets || dto.tipPresets) {
      this.validatePresets(
        dto.donationPresets ?? (existing.donationPresets as any[]),
        dto.tipPresets ?? (existing.tipPresets as any[]),
      );
    }

    const data: any = { ...dto };
    if (dto.goalAmount) data.goalAmount = Math.round(dto.goalAmount * 100);
    if (dto.expiryDate) data.expiryDate = new Date(dto.expiryDate);

    return this.repo.update(id, data);
  }

  async changeStatus(id: string, newStatus: string) {
    const campaign = await this.findById(id);
    const allowed = ALLOWED_TRANSITIONS[campaign.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot change status from ${campaign.status} to ${newStatus}. Allowed: ${allowed.join(', ') || 'none (terminal state)'}`,
      );
    }
    return this.repo.updateStatus(id, newStatus);
  }

  async duplicate(id: string, createdById: string) {
    const original = await this.findById(id);
    const newTitle = `${original.title} (Copy)`;
    const slug = await this.generateUniqueSlug(newTitle);

    return this.repo.create({
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
  }

  delete(id: string) {
    return this.repo.softDelete(id); // status -> DELETED, matches your spec's status list (not a hard delete)
  }

  async findPublicPaginated(query: QueryPublicCampaignsDto) {
    const [data, total] = await this.repo.findPublicPaginated(query);
    const withImages = await this.attachImageUrls(data);
    return {
      data: withImages,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }
}
