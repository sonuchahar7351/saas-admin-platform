import {
  IsUUID,
  IsInt,
  Min,
  IsOptional,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CreateDonationOrderDto {
  @IsUUID()
  campaignId!: string;

  @IsInt()
  @Min(1)
  amount!: number; // rupees

  @IsOptional()
  @IsInt()
  @Min(0)
  tipAmount?: number; // rupees

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean;
}
