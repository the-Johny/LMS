import { Category, Level } from '@prisma/client';
import {
  IsOptional,
  IsNumber,
  IsEnum,
  IsString,
  IsBoolean,
} from 'class-validator';

export class CourseQueryDto {
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
  @IsOptional() @IsEnum(Category) category?: Category;
  @IsOptional() @IsEnum(Level) level?: Level;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() instructorId?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
