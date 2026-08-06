import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export enum MediaCategoryDto {
  CAMPAIGN = 'CAMPAIGN',
  CATEGORY = 'CATEGORY',
  PRODUCT = 'PRODUCT',
  JOURNEY = 'JOURNEY',
  TESTIMONIAL = 'TESTIMONIAL',
  GALLERY = 'GALLERY',
}

export class UploadMediaDto {
  @IsEnum(MediaCategoryDto)
  category!: MediaCategoryDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  tags?: string[];
}
