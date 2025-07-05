import { Expose, Type } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsNumber,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { LessonResponseDto } from './lesson-response.dto';

export class ModuleResponseDto {
  @IsString()
  @Expose()
  id: string;

  @IsString()
  @Expose()
  title: string;

  @IsString()
  @Expose()
  courseId: string;

  @IsOptional()
  @IsNumber()
  @Expose()
  lessonCount?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonResponseDto)
  @Expose()
  lessons?: LessonResponseDto[];
}
