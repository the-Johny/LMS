/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CourseProgressOverviewDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Course title' })
  courseTitle: string;

  @ApiProperty({ description: 'Total number of lessons in the course' })
  totalLessons: number;

  @ApiProperty({ description: 'Total number of enrollments' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Average progress percentage across all enrollments' })
  averageProgress: number;

  @ApiProperty({ description: 'Progress statistics for each enrollment' })
  enrollmentStats: {
    enrollmentId: string;
    userId: string;
    completedLessons: number;
    totalLessons: number;
    progressPercentage: number;
  }[];
} 