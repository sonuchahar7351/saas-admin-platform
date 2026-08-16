import {
  IsOptional,
  IsString,
  IsIn,
  IsInt,
  Min,
  IsArray,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class QueryRecurringDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 10;
  @IsOptional() @IsString() sortBy: string = 'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';
  @IsOptional()
  @IsIn(['CREATED', 'ACTIVE', 'PAUSED', 'HALTED', 'CANCELLED', 'COMPLETED'])
  status?: string;
  @IsOptional() @IsIn(['WEEKLY', 'MONTHLY', 'QUARTERLY']) frequency?: string;
  @IsOptional() @IsString() search?: string;
}

export class ExportRecurringDto extends QueryRecurringDto {
  @IsIn(['bulk', 'range', 'selected']) mode!: 'bulk' | 'range' | 'selected';
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) rangeStart?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) rangeEnd?: number;
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  selectedIds?: string[];
}
