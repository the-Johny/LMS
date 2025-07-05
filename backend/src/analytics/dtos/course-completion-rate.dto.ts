/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CourseCompletionRateDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  completionRate: number;
}
