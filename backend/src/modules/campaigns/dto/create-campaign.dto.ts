import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
  IsDateString,
  IsArray,
  IsObject,
} from 'class-validator';

export class CreateCampaignDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string; // auto-generated if omitted

  @IsUUID()
  ngoId!: string;

  @IsUUID()
  categoryId!: string;

  @IsInt()
  @Min(1)
  goalAmount!: number; // rupees — converted to paise in service

  @IsString()
  shortDescription!: string;

  @IsOptional()
  @IsUUID()
  cardImageId?: string;

  @IsObject()
  story!: any; // TipTap JSON document — validated structurally, not field-by-field

  @IsDateString()
  expiryDate!: string;

  @IsArray()
  donationPresets!: { amount: number; isDefault: boolean }[];

  @IsArray()
  tipPresets!: { percentage: number; isDefault: boolean }[];
}
