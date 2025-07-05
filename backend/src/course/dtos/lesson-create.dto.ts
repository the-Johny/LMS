import { LessonType } from '@prisma/client';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class CreateLessonDto {
  @IsString() title: string;
  @IsString() contentUrl: string;
  @IsEnum(LessonType) type: LessonType;
  @IsOptional() @IsBoolean() isVisible?: boolean;
  @IsNumber() order: number;
  @IsString() moduleId: string;
}
