import { Controller, Post, Body, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto, LoginUserDto } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    console.log(registerUserDto);
    const user = await this.authService.register(registerUserDto);
    return { message: 'User registered successfully', user };
  }

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('me')
  async me(@Req() req: Request) {
    const userid = req['user'].sub;
    return this.authService.getById(Number(userid));
  }
}
