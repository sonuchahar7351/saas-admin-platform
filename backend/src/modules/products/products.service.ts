import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { AiService } from '../ai/ai.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MediaRepository } from '../media/media.repository';

@Injectable()
export class ProductsService {
  constructor(
    private repo: ProductsRepository,
    private mediaRepo: MediaRepository,
    private aiService: AiService,
  ) {}

  async findByCampaign(campaignId: string, onlyActive = false) {
    const items = await this.repo.findByCampaign(campaignId, onlyActive);
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

  create(dto: CreateProductDto) {
    return this.repo.create({ ...dto, amount: Math.round(dto.amount * 100) });
  }

  async update(id: string, dto: UpdateProductDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Product not found');
    const data: any = { ...dto };
    if (dto.amount) data.amount = Math.round(dto.amount * 100);
    return this.repo.update(id, data);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Product not found');
    return this.repo.delete(id);
  }

  generateWithAi(campaignTitle: string, categoryName: string) {
    return this.aiService.generateProduct({ campaignTitle, categoryName });
  }
}
