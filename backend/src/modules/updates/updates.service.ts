import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdatesRepository } from './updates.repository';
import { MediaRepository } from '../media/media.repository';
import { AiService } from '../ai/ai.service';
import {
  CreateUpdateDto,
  UpdateUpdateDto,
  CreateGlimpseDto,
} from './dto/updates.dto';
import { textToTipTapJson } from '../../common/utils/text-to-tiptap';

@Injectable()
export class UpdatesService {
  constructor(
    private repo: UpdatesRepository,
    private mediaRepo: MediaRepository,
    private aiService: AiService,
  ) {}

  // shared helper — resolves mediaId -> url across any set of updates' nested glimpse images,
  // one batch query regardless of how many updates/glimpses/images are involved
  private async attachImageUrls(updates: any[]) {
    const allMediaIds = updates.flatMap((u) =>
      u.glimpses.flatMap((g: any) => g.images.map((img: any) => img.mediaId)),
    );
    const uniqueIds = [...new Set(allMediaIds)];
    if (uniqueIds.length === 0) return updates;

    const mediaItems = await this.mediaRepo.findByIds(uniqueIds);
    const urlById = new Map(mediaItems.map((m) => [m.id, m.url]));

    return updates.map((u) => ({
      ...u,
      glimpses: u.glimpses.map((g: any) => ({
        ...g,
        images: g.images.map((img: any) => ({
          ...img,
          url: urlById.get(img.mediaId) || null,
        })),
      })),
    }));
  }

  async findByCampaign(campaignId: string) {
    const updates = await this.repo.findByCampaign(campaignId);
    return this.attachImageUrls(updates);
  }

  create(dto: CreateUpdateDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateUpdateDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Update not found');
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Update not found');
    return this.repo.delete(id);
  }

  async generateWithAi(campaignTitle: string, context: string) {
    const text = await this.aiService.generateUpdate({
      campaignTitle,
      context,
    });
    return { content: textToTipTapJson(text) };
  }

  // ---- Glimpses ----

  async createGlimpse(dto: CreateGlimpseDto) {
    const update = await this.repo.findById(dto.updateId);
    if (!update) throw new NotFoundException('Update not found');
    const order = dto.order ?? update.glimpses.length;
    const glimpse = await this.repo.createGlimpse(
      dto.updateId,
      order,
      dto.mediaIds || [],
    );
    return this.resolveGlimpseImageUrls(glimpse);
  }

  async deleteGlimpse(id: string) {
    const glimpse = await this.repo.findGlimpseById(id);
    if (!glimpse) throw new NotFoundException('Glimpse not found');
    return this.repo.deleteGlimpse(id);
  }

  async addGlimpseImages(glimpseId: string, mediaIds: string[]) {
    const glimpse = await this.repo.findGlimpseById(glimpseId);
    if (!glimpse) throw new NotFoundException('Glimpse not found');
    await this.repo.addGlimpseImages(
      glimpseId,
      mediaIds,
      glimpse.images.length,
    );
    const updated = await this.repo.findGlimpseById(glimpseId);
    return this.resolveGlimpseImageUrls(updated);
  }

  removeGlimpseImage(id: string) {
    return this.repo.removeGlimpseImage(id);
  }

  private async resolveGlimpseImageUrls(glimpse: any) {
    if (!glimpse.images.length) return glimpse;
    const mediaItems = await this.mediaRepo.findByIds(
      glimpse.images.map((i: any) => i.mediaId),
    );
    const urlById = new Map(mediaItems.map((m) => [m.id, m.url]));
    return {
      ...glimpse,
      images: glimpse.images.map((img: any) => ({
        ...img,
        url: urlById.get(img.mediaId) || null,
      })),
    };
  }
}
