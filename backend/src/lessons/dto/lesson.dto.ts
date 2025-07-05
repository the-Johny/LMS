import { IsString, IsOptional, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { LessonType } from '@prisma/client';

export class CreateLessonDto {
  @ApiProperty({ example: 'Introduction to Variables' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'https://example.com/video.mp4' })
  @IsString()
  contentUrl: string;

  @ApiProperty({ enum: LessonType, example: LessonType.VIDEO })
  @IsEnum(LessonType)
  type: LessonType;

  @ApiProperty({ example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ example: 'uuid-of-module' })
  @IsString()
  moduleId: string;

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class UpdateLessonDto {
  @ApiProperty({ example: 'Advanced Variables' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'https://example.com/updated-video.mp4' })
  @IsOptional()
  @IsString()
  contentUrl?: string;

  @ApiProperty({ enum: LessonType })
  @IsOptional()
  @IsEnum(LessonType)
  type?: LessonType;

  @ApiProperty({ example: 2 })
  @IsOptional()
  @IsNumber()
  order?: number;

  @ApiProperty()
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;
}

export class LessonResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  contentUrl: string;

  @ApiProperty({ enum: LessonType })
  type: LessonType;

  @ApiProperty()
  order: number;

  @ApiProperty()
  moduleId: string;

  @ApiProperty()
  isVisible: boolean;
} 