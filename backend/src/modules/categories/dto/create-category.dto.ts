import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;
}
