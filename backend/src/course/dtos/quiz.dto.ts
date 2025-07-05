import { QuestionType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsString,
  IsBoolean,
  IsEnum,
  IsOptional,
  ValidateNested,
  IsArray,
  IsNumber,
  IsObject,
} from 'class-validator';

export class CreateOptionDto {
  @IsString() value: string;
  @IsBoolean() isCorrect: boolean;
}

export class CreateQuestionDto {
  @IsString() question: string;
  @IsEnum(QuestionType) type: QuestionType;
  @IsOptional() @IsString() answer?: string;

  @ValidateNested({ each: true })
  @Type(() => CreateOptionDto)
  @IsArray()
  options: CreateOptionDto[];
}

export class CreateQuizDto {
  @IsString() title: string;
  @IsString() courseId: string;
  @IsOptional() @IsNumber() timeLimit?: number;

  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  @IsArray()
  questions: CreateQuestionDto[];
}

export class SubmitQuizDto {
  @IsObject()
  answers: Record<string, string>;
}
