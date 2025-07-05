import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateReviewDto {
  @IsNumber() rating: number;
  @IsOptional() @IsString() comment?: string;
  @IsString() courseId: string;
}
