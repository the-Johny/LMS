import { Category, Level } from '@prisma/client';
import { Expose } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
} from 'class-validator';

export class CourseResponseDto {
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  title: string;

  @IsString()
  @Expose()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @Expose()
  objectives: string[];

  @IsArray()
  @IsString({ each: true })
  @Expose()
  prerequisites: string[];

  @IsEnum(Level)
  @Expose()
  level: Level;

  @IsEnum(Category)
  @Expose()
  category: Category;

  @IsBoolean()
  @Expose()
  isPublished: boolean;

  @IsString()
  @Expose()
  instructorId: string;

  @IsString()
  @Expose()
  instructorName: string;

  @IsDate()
  @Expose()
  createdAt: Date;

  @IsDate()
  @Expose()
  updatedAt: Date;

  @IsOptional()
  @IsNumber()
  @Expose()
  enrollmentCount?: number;

  @IsOptional()
  @IsNumber()
  @Expose()
  averageRating?: number;

  @IsOptional()
  @IsNumber()
  @Expose()
  moduleCount?: number;
}
