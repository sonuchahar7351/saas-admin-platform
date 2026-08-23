import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMorphCampaignsDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 10;
  @IsOptional() @IsString() search?: string;
  @IsOptional()
  @IsIn(['CREATED', 'ACTIVE', 'COMPLETED', 'DELETED'])
  status?: string;
  @IsOptional() @IsString() parentCampaignId?: string;
  @IsOptional() @IsIn(['createdAt', 'title']) sortBy: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';
}
