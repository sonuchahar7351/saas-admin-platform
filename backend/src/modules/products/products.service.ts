import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductsRepository } from './products.repository';
import { AiService } from '../ai/ai.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private repo: ProductsRepository,
    private aiService: AiService,
  ) {}

  findByCampaign(campaignId: string, onlyActive = false) {
    return this.repo.findByCampaign(campaignId, onlyActive);
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
