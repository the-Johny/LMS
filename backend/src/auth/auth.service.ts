// auth/auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { User, Role } from '@prisma/client';
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  AuthResponseDto,
} from './dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Create user
      const user = await this.prisma.user.create({
        data: {
          name: dto.name.trim(),
          email: dto.email.toLowerCase(),
          password: hashedPassword,
          role: dto.role,
          resetToken: verificationToken,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      // Send verification email (implement this based on your email service)
      await this.sendVerificationEmail(user.email, verificationToken);

      // Generate JWT tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    try {
      // Find user by email
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(dto.password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Generate JWT tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Login failed');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
        select: { id: true, email: true, name: true },
      });

      if (!user) {
        // Don't reveal if user exists or not for security
        return { message: 'If an account with that email exists, a password reset link has been sent.' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken },
      });

      // Send reset password email
      await this.sendResetPasswordEmail(user.email, resetToken, user.name);

      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to process password reset request');
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { resetToken: dto.token },
        select: { id: true, createdAt: true },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired reset token');
      }

      // Check if token is not too old (1 hour expiry)
      const tokenAge = Date.now() - user.createdAt.getTime();
      if (tokenAge > 3600000) {
        throw new BadRequestException('Reset token has expired');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

      // Update user password and clear reset token
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
        },
      });

      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to reset password');
    }
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, password: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        dto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      // Check if new password is different from current password
      const isSamePassword = await bcrypt.compare(dto.newPassword, user.password);
      if (isSamePassword) {
        throw new BadRequestException('New password must be different from current password');
      }

      // Hash new password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(dto.newPassword, saltRounds);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      return { message: 'Password changed successfully' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to change password');
    }
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { resetToken: token },
        select: { id: true, isEmailVerified: true },
      });

      if (!user) {
        throw new BadRequestException('Invalid or expired verification token');
      }

      if (user.isEmailVerified) {
        return { message: 'Email is already verified' };
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: true,
          resetToken: null,
        },
      });

      return { message: 'Email verified successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify email');
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwt.verify(refreshToken, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password' | 'resetToken'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user profile');
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true, email: true, name: true, isEmailVerified: true },
      });

      if (!user) {
        return { message: 'If an account with that email exists, a verification email has been sent.' };
      }

      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      await this.prisma.user.update({
        where: { id: user.id },
        data: { resetToken: verificationToken },
      });

      // Send verification email
      await this.sendVerificationEmail(user.email, verificationToken);

      return { message: 'Verification email sent successfully' };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to resend verification email');
    }
  }

  async logout(userId: string): Promise<{ message: string }> {
    try {
      // In a more advanced implementation, you might want to blacklist the token
      // or store refresh tokens in the database and remove them here
      
      // For now, we'll just return a success message
      // The client should remove the tokens from their storage
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  // Private helper methods
  private async generateTokens(payload: {
    id: string;
    email: string;
    role: Role;
  }): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const jwtPayload: JwtPayload = {
      sub: payload.id,
      email: payload.email,
      role: payload.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(jwtPayload, {
        secret: this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN') || '15m',
      }),
      this.jwt.signAsync(jwtPayload, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN') || '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async sendVerificationEmail(email: string, token: string): Promise<void> {
    // TODO: Implement email service integration
    // This could be SendGrid, AWS SES, Nodemailer, etc.
    const verificationUrl = `${this.config.get('FRONTEND_URL')}/verify-email?token=${token}`;
    
    console.log(`Verification email would be sent to ${email}`);
    console.log(`Verification URL: ${verificationUrl}`);
    
    // Example implementation:
    // await this.emailService.sendEmail({
    //   to: email,
    //   subject: 'Verify your email address',
    //   template: 'email-verification',
    //   data: { verificationUrl, email }
    // });
  }

  private async sendResetPasswordEmail(
    email: string,
    token: string,
    name: string,
  ): Promise<void> {
    // TODO: Implement email service integration
    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    
    console.log(`Password reset email would be sent to ${email}`);
    console.log(`Reset URL: ${resetUrl}`);
    
    // Example implementation:
    // await this.emailService.sendEmail({
    //   to: email,
    //   subject: 'Reset your password',
    //   template: 'password-reset',
    //   data: { resetUrl, name, email }
    // });
  }

  // Admin methods (if needed)
  async getUserById(userId: string): Promise<Omit<User, 'password' | 'resetToken'>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isEmailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateUserRole(userId: string, role: Role): Promise<{ message: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { role },
      });

      return { message: 'User role updated successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update user role');
    }
  }
}