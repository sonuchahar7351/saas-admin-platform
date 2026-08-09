import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaRepository } from '../media/media.repository';
import { AiService } from '../ai/ai.service';
import {
  CreateTestimonialDto,
  UpdateTestimonialDto,
} from './dto/testimonial.dto';
import { TestimonialsRepository } from './testimonials.reopsitory';

@Injectable()
export class TestimonialsService {
  constructor(
    private repo: TestimonialsRepository,
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

  create(dto: CreateTestimonialDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Testimonial not found');
    return this.repo.delete(id);
  }

  async generateWithAi(campaignTitle: string, personaContext: string) {
    const prompt = `Write one realistic-sounding donor/beneficiary testimonial for a crowdfunding campaign.

Campaign: ${campaignTitle}
Who's speaking: ${personaContext}

Respond ONLY with valid JSON, no markdown: {"name": "...", "designation": "...", "description": "..."}
- name: a plausible full name
- designation: their relation (e.g. "Donor", "Beneficiary's parent")
- description: 2-3 sentence testimonial, genuine and specific, not generic praise`;
    const raw = await this.aiService.generateText(prompt);
    try {
      return JSON.parse(raw.replace(/```json|```/g, '').trim());
    } catch {
      throw new Error('AI returned an unexpected format. Try again.');
    }
  }
}
