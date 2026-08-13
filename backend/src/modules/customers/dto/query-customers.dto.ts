import { IsOptional, IsString, IsIn, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryCustomersDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page: number = 1;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) limit: number = 10;
  @IsOptional() @IsIn(['name', 'email', 'createdAt']) sortBy: string =
    'createdAt';
  @IsOptional() @IsIn(['asc', 'desc']) sortOrder: 'asc' | 'desc' = 'desc';
  @IsOptional() @IsString() search?: string;
}
