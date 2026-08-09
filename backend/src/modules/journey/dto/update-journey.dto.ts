import { IsString, IsUUID, IsOptional, IsInt, Min } from 'class-validator';
export class UpdateJourneyDto {
  @IsOptional() @IsUUID() imageId?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsInt() @Min(0) order?: number;
}
