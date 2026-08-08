import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryDonationsDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 10;

  @IsOptional() @IsString() sortBy: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsIn(['CREATED', 'PAID', 'FAILED', 'REFUNDED'])
  status?: string;
  @IsOptional() @IsString() campaignId?: string;
  @IsOptional() @IsString() search?: string; // matches name, email, payment id/ref, campaign slug

  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
}
