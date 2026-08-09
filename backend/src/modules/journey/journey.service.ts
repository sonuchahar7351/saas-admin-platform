import { Injectable, NotFoundException } from '@nestjs/common';
import { JourneyRepository } from './journey.repository';
import { MediaRepository } from '../media/media.repository';
import { AiService } from '../ai/ai.service';
import { CreateJourneyDto } from './dto/create-journey.dto';
import { UpdateJourneyDto } from './dto/update-journey.dto';

@Injectable()
export class JourneyService {
  constructor(
    private repo: JourneyRepository,
    private mediaRepo: MediaRepository,
    private aiService: AiService,
  ) {}

  async findByCampaign(campaignId: string) {
    const items = await this.repo.findByCampaign(campaignId);
    const imageIds = items.map((i) => i.imageId).filter(Boolean) as string[];
    if (imageIds.length === 0)
      return items.map((i) => ({ ...i, imageUrl: null }));
    const media = await this.mediaRepo.findByIds(imageIds);
    const urlById = new Map(media.map((m) => [m.id, m.url]));
    return items.map((i) => ({
      ...i,
      imageUrl: i.imageId ? urlById.get(i.imageId) || null : null,
    }));
  }

  create(dto: CreateJourneyDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateJourneyDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Journey step not found');
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Journey step not found');
    return this.repo.delete(id);
  }

  async generateWithAi(campaignTitle: string, stageContext: string) {
    const prompt = `Write one journey milestone for a crowdfunding campaign timeline.

Campaign: ${campaignTitle}
Stage: ${stageContext}

Respond ONLY with valid JSON, no markdown: {"title": "...", "description": "..."}
- title: short milestone name (a few words)
- description: 1-2 sentences`;
    const raw = await this.aiService.generateText(prompt);
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      throw new Error('AI returned an unexpected format. Try again.');
    }
  }
}
