import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private repo: CategoriesRepository) {}

  findAll(onlyActive = false) {
    return this.repo.findAll(onlyActive);
  }

  async create(dto: CreateCategoryDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');
    return this.repo.update(id, dto);
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');

    // guard against deleting a category still in use — a real production concern,
    // not just theoretical (spec says only Active categories show on the campaign form,
    // but existing campaigns still reference this row via FK)
    const inUse = await this.repo.countCampaigns(id);
    if (inUse > 0) {
      throw new ConflictException(
        `Cannot delete — ${inUse} campaign(s) still use this category. Deactivate it instead.`,
      );
    }
    return this.repo.delete(id);
  }
}
