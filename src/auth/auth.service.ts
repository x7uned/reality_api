import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto, RegisterUserDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerUserDto: RegisterUserDto) {
    const { username, email, password } = registerUserDto;
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(registerUserDto);

    // Проверка существования пользователя
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    await this.prisma.user.create({
      data: {
        username,
        email,
        status: 'default',
        password: hashedPassword,
      },
    });

    return { success: true };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      delete user.password;
      return user;
    }
    return null;
  }

  async login(loginUserDto: LoginUserDto) {
    const { login, password } = loginUserDto;
    console.log(login);

    const user = await this.prisma.user.findFirst({
      where: { OR: [{ email: login }, { username: login }] },
    });

    const isPasswordCorrect =
      user && (await bcrypt.compare(password, user.password));

    if (!user || !isPasswordCorrect) {
      throw new UnauthorizedException('Login or password is invalid');
    }

    const access_token = this.jwtService.sign(
      { sub: user.id, email: user.email },
      { expiresIn: '7d', secret: process.env.JWT_SECRET },
    );

    delete user.password;

    return {
      user,
      access_token,
    };
  }

  async getById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (user) {
      delete user.password;
      return user;
    }
    return null;
  }
}
