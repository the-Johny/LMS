import { IsOptional, IsString, IsNumber } from 'class-validator';

export class EnrollmentQueryDto {
  @IsOptional() @IsString() userId?: string;
  @IsOptional() @IsString() courseId?: string;
  @IsOptional() @IsNumber() page?: number;
  @IsOptional() @IsNumber() limit?: number;
}
