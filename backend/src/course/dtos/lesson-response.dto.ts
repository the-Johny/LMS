import { LessonType } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';

export class LessonResponseDto {
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  title: string;

  @IsString()
  @Expose()
  contentUrl: string;

  @IsEnum(LessonType)
  @Expose()
  type: LessonType;

  @IsBoolean()
  @Expose()
  isVisible: boolean;

  @IsNumber()
  @Expose()
  order: number;

  @IsString()
  @Expose()
  moduleId: string;

  @IsOptional()
  @IsBoolean()
  @Expose()
  isCompleted?: boolean;

  @IsOptional()
  @IsDate()
  @Expose()
  completedAt?: Date;
}
