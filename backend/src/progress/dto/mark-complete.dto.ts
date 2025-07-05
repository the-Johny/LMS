/* eslint-disable prettier/prettier */
import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkCompleteDto {
  @ApiProperty({ description: 'Enrollment ID of the student' })
  @IsUUID()
  enrollmentId: string;

  @ApiProperty({ description: 'Lesson ID to mark as completed' })
  @IsUUID()
  lessonId: string;
}
