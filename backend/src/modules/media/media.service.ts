import { Injectable, NotFoundException } from '@nestjs/common';
import { S3Service } from './s3.service';
import { MediaRepository } from './media.repository';
import { UploadMediaDto } from './dto/upload-media.dto';
import { MulterFile } from '../../common/types/multer-file.type';

@Injectable()
export class MediaService {
  constructor(
    private s3: S3Service,
    private repo: MediaRepository,
  ) {}

  async upload(file: MulterFile, dto: UploadMediaDto, uploadedById: string) {
    const { key, url } = await this.s3.upload(file, dto.category.toLowerCase());
    return this.repo.create({
      url,
      key,
      category: dto.category,
      tags: dto.tags || [],
      uploadedById,
    });
  }

  findAll(category?: string) {
    return this.repo.findAll(category);
  }

  async delete(id: string) {
    const media = await this.repo.findById(id);
    if (!media) throw new NotFoundException('Media not found');
    await this.s3.delete(media.key);
    return this.repo.delete(id);
  }
}
