/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total number of users on the platform' })
  totalUsers: number;

  @ApiProperty({ description: 'Total number of courses' })
  totalCourses: number;

  @ApiProperty({ description: 'Total number of enrollments' })
  totalEnrollments: number;

  @ApiProperty({ description: 'Total number of certificates issued' })
  totalCertificates: number;

  @ApiProperty({ description: 'Number of enrollments in the last 7 days' })
  recentEnrollments: number;

  @ApiProperty({ description: 'Top 5 courses by enrollment count' })
  topCourses: {
    id: string;
    title: string;
    enrollmentCount: number;
  }[];
} 