import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class RegisterUserDto {
  @IsEmail()
  @MaxLength(40)
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;
}

export class LoginUserDto {
  @IsNotEmpty()
  @MaxLength(40)
  @IsString()
  login: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  @IsNotEmpty()
  password: string;
}
