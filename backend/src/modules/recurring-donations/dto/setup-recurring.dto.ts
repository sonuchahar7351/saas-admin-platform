import {
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DonorDto } from '../../donations/dto/create-donation-order.dto';

export enum RecurringFrequencyDto {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
}

export class SetupRecurringDto {
  @IsUUID() campaignId!: string;
  @IsEnum(RecurringFrequencyDto) frequency!: RecurringFrequencyDto;
  @IsInt() @Min(1) amount!: number;
  @IsOptional() @IsInt() @Min(0) tipPercentage?: number;
  @ValidateNested() @Type(() => DonorDto) donor!: DonorDto;
  @IsOptional() @IsString() guestPassword?: string;
}
