/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class LearningPathDto {
  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiProperty({ description: 'Number of completed courses' })
  completedCourses: number;

  @ApiProperty({ description: 'Number of courses in progress' })
  inProgressCourses: number;

  @ApiProperty({ description: 'Total number of enrollments' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Categories of completed courses' })
  completedCategories: string[];

  @ApiProperty({ description: 'Recommended courses based on learning history' })
  recommendedCourses: {
    id: string;
    title: string;
    category: string;
    level: string;
    enrollmentCount: number;
    reviewCount: number;
  }[];
} 