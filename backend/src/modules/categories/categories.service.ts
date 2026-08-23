import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CategoriesRepository } from './categories.repository';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CacheService } from '../../common/cache/cache.service';
import { MediaRepository } from '../media/media.repository';

@Injectable()
export class CategoriesService {
  constructor(
    private repo: CategoriesRepository,
    private cache: CacheService,
    private mediaRepo: MediaRepository,
  ) {}

  private async attachImageUrl(categories: any[]) {
    const ids = categories.map((c) => c.imageId).filter(Boolean);
    if (ids.length === 0)
      return categories.map((c) => ({ ...c, imageUrl: null }));
    const media = await this.mediaRepo.findByIds(ids);
    const urlById = new Map(media.map((m) => [m.id, m.url]));
    return categories.map((c) => ({
      ...c,
      imageUrl: c.imageId ? urlById.get(c.imageId) || null : null,
    }));
  }

  async findAll(onlyActive = false) {
    if (!onlyActive) {
      const categories = await this.repo.findAll();

      return this.attachImageUrl(categories);
    }

    return this.cache.getOrSet('cache:categories:public', 300, async () => {
      const categories = await this.repo.findAll(true);

      return this.attachImageUrl(categories);
    });
  }

  async create(dto: CreateCategoryDto) {
    const created = await this.repo.create(dto);
    await this.cache.del('cache:categories:public');
    const [withImage] = await this.attachImageUrl([created]);
    return withImage;
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Category not found');
    const result = await this.repo.update(id, dto);
    await this.cache.del('cache:categories:public');
    const [withImage] = await this.attachImageUrl([result]);
    return withImage;
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
