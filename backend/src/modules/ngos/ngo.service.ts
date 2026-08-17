import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NgosRepository } from './ngos.repository';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';
import { CacheService } from '../../common/cache/cache.service';

@Injectable()
export class NgosService {
  constructor(
    private repo: NgosRepository,
    private cache: CacheService,
  ) {}

  async findAll(onlyActive = false) {
    if (!onlyActive) return this.repo.findAll(); // admin list — always fresh, not cached
    return this.cache.getOrSet('cache:categories:public', 300, () =>
      this.repo.findAll(true),
    );
  }

  async create(dto: CreateNgoDto) {
    const result = await this.repo.create(dto);
    await this.cache.del('cache:categories:public');
    return result;
  }

  async update(id: string, dto: UpdateNgoDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('NGO not found');
    const result = await this.repo.update(id, dto);
    await this.cache.del('cache:categories:public');
    return result;
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
