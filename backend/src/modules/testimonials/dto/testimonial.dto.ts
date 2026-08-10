import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateTestimonialDto {
  @IsUUID() campaignId!: string;
  @IsOptional() @IsUUID() imageId?: string;
  @IsString() name!: string;
  @IsOptional() @IsString() designation?: string;
  @IsString() description!: string;
}

export class UpdateTestimonialDto {
  @IsOptional() @IsUUID() imageId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() designation?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}
