import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class ElementDto {
  @IsInt({ message: 'ID must be an integer.' })
  id: number;

  @IsEnum(['h1', 'h2', 'h3', 'h4', 'h5', 'list', 'checks'], {
    message: 'Type must be one of: h1, h2, h3, h4, h5, list, checks.',
  })
  type: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'list' | 'checks';

  @IsString({ message: 'Content must be a string.' })
  @IsNotEmpty({ message: 'Content cannot be empty.' })
  @Length(0, 5000, {
    message: 'Content must be between 0 and 5000 characters long.',
  }) // Length restriction
  content: string;

  @IsOptional()
  @IsBoolean({ message: 'Completed must be a boolean value.' })
  completed?: boolean;
}

export class DeleteSpaceDto {
  @IsInt({ message: 'ID must be an integer.' })
  id: number;
}

export class UpdateSpaceDto {
  @IsInt({ message: 'ID must be an integer.' })
  id: number;

  @IsString({ message: 'Background must be a string.' })
  @Length(0, 255, {
    message: 'Background must be between 1 and 255 characters long.',
  })
  background: string;

  @IsString({ message: 'Name must be a string.' })
  @Length(0, 100, {
    message: 'Name must be between 1 and 100 characters long.',
  })
  name: string;

  @IsArray({ message: 'Elements must be an array.' })
  elements: ElementDto[];
}
