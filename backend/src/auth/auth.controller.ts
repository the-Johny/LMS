// auth/auth.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Param,
  Query,
  Patch,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  VerifyEmailDto,
  RefreshTokenDto,
  AuthResponseDto,
} from './dto';
import { Role } from '@prisma/client';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    role: Role;
    isEmailVerified: boolean;
  };
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Throttle(5, 60) // 5 requests per minute
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Create a new user account with email verification'
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
    type: AuthResponseDto,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation errors',
    schema: {
      example: {
        statusCode: 400,
        message: ['email must be a valid email', 'password must be longer than or equal to 6 characters'],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Conflict - user already exists',
    schema: {
      example: {
        statusCode: 409,
        message: 'User with this email already exists',
        error: 'Conflict'
      }
    }
  })
  @ApiBody({ type: RegisterDto })
  async register(
    @Body(ValidationPipe) dto: RegisterDto
  ): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(10, 60) // 10 requests per minute
  @ApiOperation({ 
    summary: 'Login user',
    description: 'Authenticate user and return JWT tokens'
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
    type: AuthResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid credentials',
    schema: {
      example: {
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized'
      }
    }
  })
  @ApiBody({ type: LoginDto })
  async login(
    @Body(ValidationPipe) dto: LoginDto
  ): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Post('forgot-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(3, 60) // 3 requests per minute
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset email to user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset email sent',
    schema: {
      example: {
        message: 'If an account with that email exists, a password reset link has been sent.'
      }
    }
  })
  @ApiBody({ type: ForgotPasswordDto })
  async forgotPassword(
    @Body(ValidationPipe) dto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(5, 60) // 5 requests per minute
  @ApiOperation({ 
    summary: 'Reset password with token',
    description: 'Reset user password using reset token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password reset successfully',
    schema: {
      example: {
        message: 'Password has been reset successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid or expired token',
    schema: {
      example: {
        statusCode: 400,
        message: 'Invalid or expired reset token',
        error: 'Bad Request'
      }
    }
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(
    @Body(ValidationPipe) dto: ResetPasswordDto
  ): Promise<{ message: string }> {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Throttle(5, 60) // 5 requests per minute
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Change user password',
    description: 'Change password for authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Password changed successfully',
    schema: {
      example: {
        message: 'Password changed successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - current password is incorrect'
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(
    @CurrentUser() user: AuthenticatedRequest['user'],
    @Body(ValidationPipe) dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.authService.changePassword(user.id, dto);
  }

  @Post('verify-email')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(5, 60) // 5 requests per minute
  @ApiOperation({ 
    summary: 'Verify user email',
    description: 'Verify user email using verification token'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    schema: {
      example: {
        message: 'Email verified successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid or expired verification token'
  })
  @ApiBody({ type: VerifyEmailDto })
  async verifyEmail(
    @Body(ValidationPipe) dto: VerifyEmailDto
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(dto.token);
  }

  @Get('verify-email/:token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Verify email via URL parameter',
    description: 'Verify user email using token from URL (useful for email links)'
  })
  @ApiParam({ 
    name: 'token', 
    description: 'Email verification token',
    example: 'abc123def456ghi789'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully'
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid or expired verification token'
  })
  async verifyEmailByParam(
    @Param('token') token: string
  ): Promise<{ message: string }> {
    return this.authService.verifyEmail(token);
  }

  @Post('resend-verification')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(3, 60) // 3 requests per minute
  @ApiOperation({ 
    summary: 'Resend verification email',
    description: 'Resend email verification link'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Verification email sent'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', format: 'email' }
      }
    }
  })
  async resendVerificationEmail(
    @Body('email') email: string
  ): Promise<{ message: string }> {
    return this.authService.resendVerificationEmail(email);
  }

  @Post('refresh-token')
  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle(20, 60) // 20 requests per minute
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get new access token using refresh token'
  })
  @ApiResponse({
    status: 200,
    description: 'Token refreshed successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid refresh token'
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(
    @Body(ValidationPipe) dto: RefreshTokenDto
  ): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve authenticated user profile information'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    schema: {
      example: {
        id: 'uuid',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'STUDENT',
        isEmailVerified: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - invalid or missing token'
  })
  async getCurrentUser(@CurrentUser() user: AuthenticatedRequest['user']) {
    return this.authService.getCurrentUser(user.id);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Logout authenticated user'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User logged out successfully'
  })
  async logout(
    @CurrentUser() user: AuthenticatedRequest['user']
  ): Promise<{ message: string }> {
    return this.authService.logout(user.id);
  }

  // Admin routes
  @Get('users/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get user by ID (Admin only)',
    description: 'Retrieve user information by ID - Admin access required'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    example: 'uuid'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User retrieved successfully'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async getUserById(
    @Param('id', ParseUUIDPipe) userId: string
  ) {
    return this.authService.getUserById(userId);
  }

  @Patch('users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Update user role (Admin only)',
    description: 'Update user role - Admin access required'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID',
    example: 'uuid'
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        role: { 
          type: 'string', 
          enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
          example: 'INSTRUCTOR'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 200, 
    description: 'User role updated successfully'
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Admin access required'
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found'
  })
  async updateUserRole(
    @Param('id', ParseUUIDPipe) userId: string,
    @Body('role') role: Role
  ): Promise<{ message: string }> {
    return this.authService.update
