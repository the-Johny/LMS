import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ enum: Role, default: Role.STUDENT })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'newpassword123', minLength: 6 })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiProperty({ enum: Role })
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: Role })
  role: Role;

  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
} 