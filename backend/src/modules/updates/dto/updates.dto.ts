import {
  IsString,
  IsUUID,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  IsObject,
} from 'class-validator';

export class CreateUpdateDto {
  @IsUUID()
  campaignId!: string;

  @IsString()
  title!: string;

  @IsObject()
  content!: any; // TipTap JSON
}

export class UpdateUpdateDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsObject() content?: any;
}

export class CreateGlimpseDto {
  @IsUUID()
  updateId!: string;

  @IsOptional() @IsInt() @Min(0) order?: number;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  mediaIds?: string[]; // can create with images right away, or add them after
}

export class AddGlimpseImagesDto {
  @IsArray()
  @IsUUID('4', { each: true })
  mediaIds!: string[];
}
