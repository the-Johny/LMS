/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Delete, Param, Body, UsePipes, ValidationPipe, UseGuards, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { EnrollUserDto, MarkLessonCompleteDto, IssueCertificateDto } from './dtos/enrollments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Enrollments
  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Enroll in a course (Student only)' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  async enroll(@Body() body: { courseId: string }, @CurrentUser() user: any) {
    return this.enrollmentsService.enrollUser(user.userId, body.courseId);
  }

  @Get('my-enrollments')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get my enrollments (Student only)' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getMyEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.getEnrollmentsByUser(user.userId);
  }

  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Get enrollments for a course (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getCourseEnrollments(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.enrollmentsService.getEnrollmentsByCourse(courseId);
  }

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all enrollments (Admin only)' })
  @ApiResponse({ status: 200, description: 'All enrollments retrieved successfully' })
  async getAllEnrollments(@CurrentUser() user: any) {
    return this.enrollmentsService.getAllEnrollments();
  }

  @Delete(':id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Unenroll from a course (Student only)' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  async unenroll(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.unenrollUser(id);
  }

  // Progress
  @Get(':enrollmentId/progress')
  @Roles(Role.STUDENT)
  getProgress(@Param('enrollmentId') enrollmentId: string, @CurrentUser() user: any) {
    return this.enrollmentsService.getProgress(enrollmentId);
  }

  @Post('progress/complete')
  @Roles(Role.STUDENT)
  markLessonComplete(@Body() body: MarkLessonCompleteDto, @CurrentUser() user: any) {
    return this.enrollmentsService.markLessonComplete(body.enrollmentId, body.lessonId);
  }

  // Certificates
  @Get('certificates/:userId')
  @Roles(Role.ADMIN, Role.STUDENT)
  getCertificatesByUser(@Param('userId') userId: string, @CurrentUser() user: any) {
    // Allow if admin, or if the user is requesting their own certificates
    if (user.role !== Role.ADMIN && user.userId !== userId) {
      throw new ForbiddenException('You are not allowed to view these certificates');
    }
    return this.enrollmentsService.getCertificatesByUser(userId);
  }

  @Post('certificates')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  issueCertificate(@Body() body: IssueCertificateDto) {
    return this.enrollmentsService.issueCertificate(body.userId, body.courseId, body.certificateUrl);
  }
}
