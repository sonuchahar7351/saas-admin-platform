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

export class ExportDonationsDto {
  // same filters as the admin table — never ignore what's currently applied
  @IsOptional()
  @IsIn(['CREATED', 'PAID', 'FAILED', 'REFUNDED'])
  status?: string;
  @IsOptional() @IsString() campaignId?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;

  @IsIn(['bulk', 'range', 'selected'])
  mode!: 'bulk' | 'range' | 'selected';

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) rangeStart?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) rangeEnd?: number;

  @IsOptional() @IsArray() @IsUUID('4', { each: true }) selectedIds?: string[];
}
