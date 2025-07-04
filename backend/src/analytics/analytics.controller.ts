import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { ApiTags, ApiOkResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { StudentProgressDto } from './dtos/student-progress.dto';
import { CourseCompletionRateDto } from './dtos/course-completion-rate.dto';
import { PopularCourseDto } from './dtos/popular-course.dto';
import { InstructorCourseStatsDto } from './dtos/instructor-stats.dto';


@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiOkResponse({ type: [StudentProgressDto] })
  getStudentProgress(@Param('userId') userId: string) {
    return this.analyticsService.getStudentProgress(userId);
  }

  @Get('course/:courseId/completion-rate')
  @ApiParam({ name: 'courseId', type: String })
  @ApiOkResponse({ type: CourseCompletionRateDto })
  getCourseCompletionRate(@Param('courseId') courseId: string) {
    return this.analyticsService.getCourseCompletionRate(courseId);
  }

  @Get('popular-courses')
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOkResponse({ type: [PopularCourseDto] })
  getPopularCourses(@Query('limit') limit: string) {
    return this.analyticsService.getPopularCourses(Number(limit) || 5);
  }

  @Get('instructor/:instructorId')
  @ApiParam({ name: 'instructorId', type: String })
  @ApiOkResponse({ type: [InstructorCourseStatsDto] })
  getInstructorStats(@Param('instructorId') instructorId: string) {
    return this.analyticsService.getInstructorStats(instructorId);
  }
}
