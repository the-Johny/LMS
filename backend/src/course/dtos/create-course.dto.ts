import { Level, Category } from '@prisma/client';
import { IsString, IsArray, IsEnum } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  objectives: string[];

  @IsArray()
  @IsString({ each: true })
  prerequisites: string[];

  @IsEnum(Level)
  level: Level;

  @IsEnum(Category)
  category: Category;

  @IsString()
  instructorId: string;
}
