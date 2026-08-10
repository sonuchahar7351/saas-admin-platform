import { IsBoolean, IsOptional, IsInt, IsUUID } from 'class-validator';

export class FeatureCampaignDto {
  @IsBoolean()
  isFeatured!: boolean;

  @IsOptional()
  @IsInt()
  featuredOrder?: number;

  @IsOptional()
  @IsUUID()
  featureImageDesktopId?: string;

  @IsOptional()
  @IsUUID()
  featureImageMobileId?: string;
}
