import {
  IsString,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export enum ProductTypeDto {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  MEGA = 'MEGA',
}

export class CreateProductDto {
  @IsUUID()
  campaignId!: string;

  @IsOptional()
  @IsUUID()
  imageId?: string;

  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;

  @IsInt()
  @Min(1)
  amount!: number; // rupees

  @IsEnum(ProductTypeDto)
  type!: ProductTypeDto;
}
