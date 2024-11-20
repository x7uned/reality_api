import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
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
  date: string;
}
