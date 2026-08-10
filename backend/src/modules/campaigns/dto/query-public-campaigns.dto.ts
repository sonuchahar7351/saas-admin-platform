import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryPublicCampaignsDto {
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsIn(['ACTIVE', 'COMPLETED']) status?: string;
  @IsOptional()
  @IsIn(['newest', 'oldest', 'mostFunded', 'leastFunded', 'endingSoon'])
  sortBy?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 12;
}
