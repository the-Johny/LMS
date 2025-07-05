/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class InstructorCourseStatsDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  students: number;

  @ApiProperty()
  reviews: number;

  @ApiProperty()
  averageRating: number;
}
