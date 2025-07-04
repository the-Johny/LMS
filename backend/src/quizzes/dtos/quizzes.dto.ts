/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsString, IsNotEmpty, IsOptional, IsInt, IsArray, IsEnum } from 'class-validator';
import { QuestionType } from '@prisma/client';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsInt()
  @IsOptional()
  timeLimit?: number;
}

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsInt()
  timeLimit?: number;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsEnum(QuestionType)
  type: QuestionType;

  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsArray()
  options: { value: string; isCorrect: boolean }[];

  @IsString()
  @IsOptional()
  answer?: string;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  question?: string;

  @IsOptional()
  @IsEnum(QuestionType)
  type?: QuestionType;

  @IsOptional()
  @IsString()
  quizId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  options?: string[];

  @IsOptional()
  @IsString()
  answer?: string;
}

export class CreateAttemptDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  quizId: string;

  @IsArray()
  answers: { questionId: string; answer: string }[];
} 