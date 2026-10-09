import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MediaRepository } from './media.repository';
import { S3Service } from './s3.service';
import { ImageGenerationService } from '../ai/image-generation.service';

@Module({
  controllers: [MediaController],
  providers: [MediaService, MediaRepository, S3Service, ImageGenerationService],
  exports: [MediaService, MediaRepository, S3Service],
})
export class MediaModule {}
