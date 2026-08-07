import { IsString, IsInt, Min } from 'class-validator';

export class GenerateStoryDto {
  @IsString()
  title!: string;

  @IsString()
  categoryName!: string;

  @IsInt()
  @Min(1)
  goalAmount!: number;

  @IsString()
  description!: string;
}
