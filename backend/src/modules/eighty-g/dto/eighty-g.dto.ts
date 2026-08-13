import { IsString, IsUUID, IsEmail, Matches, Length } from 'class-validator';

export class ApplyEightyGDto {
  @IsUUID()
  donationId!: string;

  @IsString()
  @Matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: 'PAN must be in the format ABCDE1234F',
  })
  panNumber!: string;

  @IsString()
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  address!: string;
}

export class RejectEightyGDto {
  @IsString()
  @Length(5, 500)
  reason!: string;
}
