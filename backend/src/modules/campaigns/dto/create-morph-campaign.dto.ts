import { IsUUID, IsString } from 'class-validator';

export class CreateMorphCampaignDto {
  @IsUUID() parentCampaignId!: string;
  @IsString() title!: string;
}
