import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
