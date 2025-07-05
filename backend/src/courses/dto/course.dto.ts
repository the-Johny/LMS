/* eslint-disable prettier/prettier */
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Level, Category } from '@prisma/client';

export class CreateCourseDto {
  @ApiProperty({ example: 'Introduction to Programming' })
  @IsString()
  title: string;

  @ApiProperty({
    example: 'Learn the basics of programming with this comprehensive course.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: ['Understand basic programming concepts', 'Write simple programs'],
  })
  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @ApiProperty({ example: ['Basic computer knowledge'] })
  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @ApiProperty({ enum: Level, example: Level.BEGINNER })
  @IsEnum(Level)
  level: Level;

  @ApiProperty({ enum: Category, example: Category.PROGRAMMING })
  @IsEnum(Category)
  category: Category;

  @ApiProperty({ default: false })
  @IsBoolean()
  isPublished: boolean;

  @IsOptional()
  @IsString()
  instructorId?: string;
}

export class UpdateCourseDto {
  @ApiProperty({ example: 'Advanced Programming Concepts' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Advanced programming concepts and techniques.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: ['Master advanced concepts', 'Build complex applications'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  objectives?: string[];

  @ApiProperty({ example: ['Basic programming knowledge'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  prerequisites?: string[];

  @ApiProperty({ enum: Level })
  @IsOptional()
  @IsEnum(Level)
  level?: Level;

  @ApiProperty({ enum: Category })
  @IsOptional()
  @IsEnum(Category)
  category?: Category;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  instructorId?: string;
}

export class CourseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  objectives: string[];

  @ApiProperty()
  prerequisites: string[];

  @ApiProperty({ enum: Level })
  level: Level;

  @ApiProperty({ enum: Category })
  category: Category;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  instructorId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
