/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class CourseEngagementDto {
  @ApiProperty({ description: 'Course ID' })
  courseId: string;

  @ApiProperty({ description: 'Time period for the analytics' })
  period: string;

  @ApiProperty({ description: 'Number of enrollments in the period' })
  enrollments: number;

  @ApiProperty({ description: 'Number of lesson completions in the period' })
  completions: number;

  @ApiProperty({ description: 'Number of reviews in the period' })
  reviews: number;

  @ApiProperty({ description: 'Engagement score (0-100)' })
  engagementScore: number;
} 