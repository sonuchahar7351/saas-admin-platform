import { Type } from 'class-transformer';
import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
  ValidateNested,
  IsEmail,
  IsEnum,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

export class DonorDto {
  @IsString() name!: string;
  @IsEmail() email!: string;
  @IsString() pincode!: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() streetAddress?: string;
}

export class ProductItemDto {
  @IsUUID() productId!: string;
  @IsInt() @Min(1) quantity!: number;
}

export enum DonationTypeDto {
  AMOUNT = 'AMOUNT',
  PRODUCT = 'PRODUCT',
}

export class CreateDonationDto {
  @IsUUID() campaignId!: string;

  @IsEnum(DonationTypeDto) donationType!: DonationTypeDto;

  @IsOptional() @IsInt() @Min(1) amount?: number; // rupees — required if donationType is AMOUNT
  @IsOptional() @IsInt() @Min(0) tipAmount?: number;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products?: ProductItemDto[]; // required if donationType is PRODUCT

  @ValidateNested()
  @Type(() => DonorDto)
  donor!: DonorDto;

  @IsOptional() @IsString() guestPassword?: string; // used only when creating a brand-new guest account
  @IsOptional() @IsString() message?: string;
  @IsOptional() @IsBoolean() isAnonymous?: boolean;
}
