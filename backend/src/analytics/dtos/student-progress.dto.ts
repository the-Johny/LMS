import { ApiProperty } from '@nestjs/swagger';

export class StudentProgressDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  courseTitle: string;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  progressPercentage: number;
}
