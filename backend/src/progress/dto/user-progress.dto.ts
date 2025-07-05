import { ApiProperty } from '@nestjs/swagger';

export class UserProgressDto {
  @ApiProperty()
  courseId: string;

  @ApiProperty()
  completedLessons: number;

  @ApiProperty()
  totalLessons: number;

  @ApiProperty()
  progressPercentage: number;
}
