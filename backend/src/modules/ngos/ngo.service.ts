import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NgosRepository } from './ngos.repository';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';
import { CacheService } from '../../common/cache/cache.service';
import { MediaRepository } from '../media/media.repository';

@Injectable()
export class NgosService {
  constructor(
    private repo: NgosRepository,
    private cache: CacheService,
    private mediaRepo: MediaRepository,
  ) {}

  private async attachImageUrl(ngos: any[]) {
    const ids = ngos.map((c) => c.logoId).filter(Boolean);
    if (ids.length === 0) return ngos.map((c) => ({ ...c, logoUrl: null }));
    const media = await this.mediaRepo.findByIds(ids);
    const urlById = new Map(media.map((m) => [m.id, m.url]));
    return ngos.map((c) => ({
      ...c,
      logoUrl: c.logoId ? urlById.get(c.logoId) || null : null,
    }));
  }

  async findAll(onlyActive = false) {
    if (!onlyActive) {
      const ngos = await this.repo.findAll();
      return this.attachImageUrl(ngos);
    }
    return this.cache.getOrSet('cache:categories:public', 300, async () => {
      const ngos = await this.repo.findAll(true);
      return this.attachImageUrl(ngos);
    });
  }

  async create(dto: CreateNgoDto) {
    const result = await this.repo.create(dto);
    await this.cache.del('cache:categories:public');
    const [withImage] = await this.attachImageUrl([result]);
    return withImage;
  }

  async update(id: string, dto: UpdateNgoDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('NGO not found');
    const result = await this.repo.update(id, dto);
    await this.cache.del('cache:categories:public');
    const [withImage] = await this.attachImageUrl([result]);
    return withImage;
  }

  async delete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('NGO not found');
    const inUse = await this.repo.countCampaigns(id);
    if (inUse > 0) {
      throw new ConflictException(
        `Cannot delete — ${inUse} campaign(s) still use this NGO. Deactivate it instead.`,
      );
    }
    const result = await this.repo.delete(id);
    await this.cache.del('cache:categories:public');
    return result;
  }
}
