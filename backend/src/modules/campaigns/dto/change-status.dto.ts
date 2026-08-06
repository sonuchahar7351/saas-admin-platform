import { IsEnum } from 'class-validator';

export enum CampaignStatusDto {
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  DELETED = 'DELETED',
}

export class ChangeStatusDto {
  @IsEnum(CampaignStatusDto)
  status!: CampaignStatusDto;
}
