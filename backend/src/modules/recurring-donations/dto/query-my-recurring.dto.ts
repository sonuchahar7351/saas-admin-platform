import { IsOptional, IsIn, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryMyRecurringDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 10;
  @IsOptional()
  @IsIn(['CREATED', 'ACTIVE', 'PAUSED', 'HALTED', 'CANCELLED', 'COMPLETED'])
  status?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional()
  @IsIn(['createdAt', 'amount', 'nextChargeDate', 'status'])
  sortBy: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';
}
