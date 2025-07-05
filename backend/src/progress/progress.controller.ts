/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, Body, Put, Delete, Query, UseGuards, UsePipes, ValidationPipe, ForbiddenException } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { MarkCompleteDto } from './dto/mark-complete.dto';
import { BulkMarkCompleteDto } from './dto/bulk-mark-complete.dto';
import { ApiTags, ApiBody, ApiOkResponse, ApiParam, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserProgressDto } from './dto/user-progress.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('mark-complete')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as complete (Student only)' })
  @ApiBody({ type: MarkCompleteDto })
  @ApiResponse({ status: 201, description: 'Lesson marked as completed successfully' })
  markComplete(@Body() dto: MarkCompleteDto, @CurrentUser() user: any) {
    // Verify user owns the enrollment
    return this.progressService.markLessonComplete(dto, user.userId);
  }

  @Post('mark-incomplete')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Mark lesson as incomplete (Student only)' })
  @ApiBody({ type: MarkCompleteDto })
  @ApiResponse({ status: 201, description: 'Lesson marked as incomplete successfully' })
  markIncomplete(@Body() dto: MarkCompleteDto, @CurrentUser() user: any) {
    // Verify user owns the enrollment
    return this.progressService.markLessonIncomplete(dto, user.userId);
  }

  @Post('bulk-mark-complete')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Bulk mark multiple lessons as complete (Student only)' })
  @ApiBody({ type: BulkMarkCompleteDto })
  @ApiResponse({ status: 201, description: 'Multiple lessons marked as completed successfully' })
  bulkMarkComplete(@Body() dto: BulkMarkCompleteDto, @CurrentUser() user: any) {
    // Verify user owns all enrollments
    return this.progressService.bulkMarkComplete(dto.lessons, user.userId);
  }

  @Get(':enrollmentId')
  @ApiParam({ name: 'enrollmentId', type: String })
  @ApiOperation({ summary: 'Get user course progress (Student/Instructor/Admin)' })
  @ApiResponse({ status: 200, type: UserProgressDto, description: 'User progress for the course' })
  getProgress(@Param('enrollmentId') enrollmentId: string, @CurrentUser() user: any) {
    // Students can only see their own progress, Instructors/Admins can see any
    if (user.role === Role.STUDENT) {
      return this.progressService.getUserCourseProgress(enrollmentId, user.userId);
    }
    return this.progressService.getUserCourseProgress(enrollmentId);
  }

  @Get('user/:userId/courses')
  @ApiParam({ name: 'userId', type: String })
  @ApiOperation({ summary: 'Get all course progress for a user (Student/Instructor/Admin)' })
  @ApiResponse({ status: 200, description: 'All course progress for a user' })
  getUserAllCoursesProgress(@Param('userId') userId: string, @CurrentUser() user: any) {
    // Students can only see their own progress, Instructors/Admins can see any
    if (user.role === Role.STUDENT && user.userId !== userId) {
      throw new ForbiddenException('You can only view your own progress');
    }
    return this.progressService.getUserAllCoursesProgress(userId);
  }

  @Get('course/:courseId/overview')
  @ApiParam({ name: 'courseId', type: String })
  @ApiOperation({ summary: 'Get course progress overview (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Overall course progress overview' })
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  getCourseProgressOverview(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.progressService.getCourseProgressOverview(courseId, user);
  }

  @Get('module/:moduleId/progress')
  @ApiParam({ name: 'moduleId', type: String })
  @ApiQuery({ name: 'enrollmentId', required: false, type: String })
  @ApiOperation({ summary: 'Get module progress details (Student/Instructor/Admin)' })
  @ApiResponse({ status: 200, description: 'Module progress details' })
  getModuleProgress(
    @Param('moduleId') moduleId: string,
    @Query('enrollmentId') enrollmentId?: string,
    @CurrentUser() user?: any
  ) {
    // Students can only see their own progress, Instructors/Admins can see any
    if (user?.role === Role.STUDENT && enrollmentId) {
      return this.progressService.getModuleProgress(moduleId, enrollmentId, user.userId);
    }
    return this.progressService.getModuleProgress(moduleId, enrollmentId);
  }

  @Get('lesson/:lessonId/completions')
  @ApiParam({ name: 'lessonId', type: String })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiOperation({ summary: 'Get lesson completion statistics (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Lesson completion statistics' })
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  getLessonCompletions(
    @Param('lessonId') lessonId: string,
    @Query('courseId') courseId?: string
  ) {
    return this.progressService.getLessonCompletions(lessonId, courseId);
  }

  @Get('history/:enrollmentId')
  @ApiParam({ name: 'enrollmentId', type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiOperation({ summary: 'Get progress history for an enrollment (Student/Instructor/Admin)' })
  @ApiResponse({ status: 200, description: 'Progress history for an enrollment' })
  getProgressHistory(
    @Param('enrollmentId') enrollmentId: string,
    @Query('limit') limit: string,
    @CurrentUser() user: any
  ) {
    // Students can only see their own history, Instructors/Admins can see any
    if (user.role === Role.STUDENT) {
      return this.progressService.getProgressHistory(enrollmentId, Number(limit) || 10, user.userId);
    }
    return this.progressService.getProgressHistory(enrollmentId, Number(limit) || 10);
  }

  @Put('reset/:enrollmentId')
  @ApiParam({ name: 'enrollmentId', type: String })
  @ApiOperation({ summary: 'Reset all progress for an enrollment (Student/Admin only)' })
  @ApiResponse({ status: 200, description: 'Reset all progress for an enrollment' })
  @Roles(Role.STUDENT, Role.ADMIN)
  resetProgress(@Param('enrollmentId') enrollmentId: string, @CurrentUser() user: any) {
    // Students can only reset their own progress, Admins can reset any
    if (user.role === Role.STUDENT) {
      return this.progressService.resetProgress(enrollmentId, user.userId);
    }
    return this.progressService.resetProgress(enrollmentId);
  }

  @Delete('lesson/:enrollmentId/:lessonId')
  @ApiParam({ name: 'enrollmentId', type: String })
  @ApiParam({ name: 'lessonId', type: String })
  @ApiOperation({ summary: 'Remove progress for a specific lesson (Student/Admin only)' })
  @ApiResponse({ status: 200, description: 'Remove progress for a specific lesson' })
  @Roles(Role.STUDENT, Role.ADMIN)
  removeLessonProgress(
    @Param('enrollmentId') enrollmentId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any
  ) {
    // Students can only remove their own progress, Admins can remove any
    if (user.role === Role.STUDENT) {
      return this.progressService.removeLessonProgress(enrollmentId, lessonId, user.userId);
    }
    return this.progressService.removeLessonProgress(enrollmentId, lessonId);
  }

  @Get('analytics/student/:userId')
  @ApiParam({ name: 'userId', type: String })
  @ApiQuery({ name: 'period', required: false, enum: ['week', 'month', 'year'] })
  @ApiOperation({ summary: 'Get student progress analytics (Student/Instructor/Admin)' })
  @ApiResponse({ status: 200, description: 'Student progress analytics' })
  getStudentProgressAnalytics(
    @Param('userId') userId: string,
    @Query('period') period: string = 'month',
    @CurrentUser() user: any
  ) {
    // Students can only see their own analytics, Instructors/Admins can see any
    if (user.role === Role.STUDENT && user.userId !== userId) {
      throw new ForbiddenException('You can only view your own analytics');
    }
    return this.progressService.getStudentProgressAnalytics(userId, period);
  }
}
