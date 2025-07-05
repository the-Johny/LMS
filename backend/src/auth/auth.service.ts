/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto, LoginDto, AuthResponseDto } from './dto/auth.dto';
import { JwtPayload } from './interfaces/auth.interface';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const dbUser = await this.usersService.findByEmail(loginDto.email);
    if (!dbUser || !(await bcrypt.compare(loginDto.password, dbUser.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload: JwtPayload = { sub: dbUser.id, email: dbUser.email, role: dbUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: dbUser.id, email: dbUser.email, role: dbUser.role, name: dbUser.name },
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email is already registered');
    }
    
    return this.usersService.create(registerDto);
  }

  async checkEmailAvailability(email: string) {
    const existingUser = await this.usersService.findByEmail(email);
    return {
      email,
      available: !existingUser,
      message: existingUser ? 'Email is already registered' : 'Email is available'
    };
  }
}
