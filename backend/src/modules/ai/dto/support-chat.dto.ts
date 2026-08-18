import {
  IsString,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

class ChatTurnDto {
  @IsIn(['user', 'assistant']) role!: 'user' | 'assistant';
  @IsString() @MaxLength(1000) content!: string;
}

export class SupportChatDto {
  @IsString()
  @MaxLength(500)
  message!: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10) // bound the request size — no need to send unlimited history every turn
  @ValidateNested({ each: true })
  @Type(() => ChatTurnDto)
  history?: ChatTurnDto[];

  @IsOptional()
  @IsString()
  campaignSlug?: string;
}
