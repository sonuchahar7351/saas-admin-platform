import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { NgosRepository } from './ngos.repository';
import { CreateNgoDto } from './dto/create-ngo.dto';
import { UpdateNgoDto } from './dto/update-ngo.dto';

@Injectable()
export class NgosService {
  constructor(private repo: NgosRepository) {}

  findAll(onlyActive = false) {
    return this.repo.findAll(onlyActive);
  }

  create(dto: CreateNgoDto) {
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateNgoDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('NGO not found');
    return this.repo.update(id, dto);
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
    return this.repo.delete(id);
  }
}
