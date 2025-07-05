/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import { Controller, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {
  RegisterDto,
  LoginDto,
  AuthResponseDto,
  CheckEmailDto,
  EmailAvailabilityResponseDto,
} from './dto/auth.dto';
import { UserFromJwt } from './interfaces/auth.interface';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved' })
  async getProfile(@Request() req: { user: UserFromJwt }) {
    return req.user;
  }

  @Post('check-email')
  @ApiOperation({ summary: 'Check if email is available for registration' })
  @ApiResponse({
    status: 200,
    description: 'Email availability check result',
    type: EmailAvailabilityResponseDto,
  })
  async checkEmailAvailability(@Body() checkEmailDto: CheckEmailDto) {
    return this.authService.checkEmailAvailability(checkEmailDto.email);
  }
}
