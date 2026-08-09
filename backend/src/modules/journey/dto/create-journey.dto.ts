import { IsString, IsUUID, IsOptional, IsInt, Min } from 'class-validator';

export class CreateJourneyDto {
  @IsUUID() campaignId!: string;
  @IsOptional() @IsUUID() imageId?: string;
  @IsString() title!: string;
  @IsString() description!: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}
