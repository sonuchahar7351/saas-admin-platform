import { IsString, IsEnum, MinLength, MaxLength } from 'class-validator';
import { MediaCategoryDto } from './upload-media.dto';

export class GenerateImageDto {
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  prompt!: string;

  @IsEnum(MediaCategoryDto)
  category!: MediaCategoryDto;
}
