import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateCampaignDto } from './create-campaign.dto';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class UpdateCampaignDto extends PartialType(
  OmitType(CreateCampaignDto, ['slug'] as const),
) {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  bannerImageIds?: string[];
}
