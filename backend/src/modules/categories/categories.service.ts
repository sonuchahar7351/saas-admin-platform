import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class CategoriesService {
  constructor(
    private repo: CategoriesRepository,
    private cache: CacheService,
  ) {}

  findAll(onlyActive = false) {
    if (!onlyActive) return this.repo.findAll(); // admin list — always fresh, not cached
    return this.cache.getOrSet('cache:categories:public', 300, () =>
      this.repo.findAll(true),
    );
  }

  async create(dto: CreateCategoryDto) {
    const result = await this.repo.create(dto);
    await this.cache.del('cache:categories:public');
    return result;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');
    const result = await this.repo.update(id, dto);
    await this.cache.del('cache:categories:public');
    return result;
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
    const result = await this.repo.delete(id);
    await this.cache.del('cache:categories:public');
    return result;
  }
}
