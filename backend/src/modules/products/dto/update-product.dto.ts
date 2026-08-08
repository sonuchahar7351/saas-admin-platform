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
export class UpdateProductDto {
  @IsOptional() @IsUUID() imageId?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(1) quantity?: number;
  @IsOptional() @IsInt() @Min(0) priority?: number;
  @IsOptional() @IsInt() @Min(1) amount?: number;
  @IsOptional() @IsEnum(ProductTypeDto) type?: ProductTypeDto;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
