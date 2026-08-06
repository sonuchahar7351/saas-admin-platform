import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CampaignsRepository } from './campaigns.repository';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

// allowed forward transitions only — no jumping straight to COMPLETED from CREATED, etc.
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['ACTIVE', 'DELETED'],
  ACTIVE: ['COMPLETED', 'DELETED'],
  COMPLETED: ['DELETED'],
  DELETED: [], // terminal state
};

@Injectable()
export class CampaignsService {
  constructor(private repo: CampaignsRepository) {}

  findAll(filters: { status?: string; categoryId?: string }) {
    return this.repo.findAll(filters);
  }

  async findById(id: string) {
    const campaign = await this.repo.findById(id);
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
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
}
