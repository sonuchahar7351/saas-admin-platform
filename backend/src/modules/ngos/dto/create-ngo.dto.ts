import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsUUID,
} from 'class-validator';

export class CreateNgoDto {
  @IsString()
  name!: string;

  @IsOptional() @IsUUID() logoId?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() website?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() address?: string;
}
