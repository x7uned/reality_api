import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  name: string;

  @IsOptional()
  @IsString()
  style?: string;
}

export class CreateEventDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(40)
  content: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  subContent?: string;

  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @IsNotEmpty()
  @IsString()
  date: string;
}
