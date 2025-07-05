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
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@ApiTags('Enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Enrollments
  @Post('enroll')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Enroll in a course (Student only)' })
  @ApiResponse({ status: 201, description: 'Enrolled successfully' })
  async enroll(@Body() body: { courseId: string }, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.enrollUser(user.userId, body.courseId);
  }

  @Get('my-enrollments')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get my enrollments (Student only)' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getMyEnrollments(@CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.getEnrollmentsByUser(user.userId);
  }

  @Get('course/:courseId/enrollments')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get enrollments for a course (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'Enrollments retrieved successfully' })
  async getCourseEnrollments(@Param('courseId') courseId: string, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.getEnrollmentsByCourse(courseId);
  }

  @Get('all-enrollments')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get all enrollments (Admin only)' })
  @ApiResponse({ status: 200, description: 'All enrollments retrieved successfully' })
  async getAllEnrollments(@CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.getAllEnrollments();
  }

  @Delete(':id')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Unenroll from a course (Student only)' })
  @ApiResponse({ status: 200, description: 'Unenrolled successfully' })
  async unenroll(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.unenrollUser(id);
  }

  // Progress
  @Get('progress/:enrollmentId')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  getProgress(@Param('enrollmentId') enrollmentId: string, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.getProgress(enrollmentId);
  }

  @Post('mark-lesson-complete')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  markLessonComplete(@Body() body: MarkLessonCompleteDto, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.markLessonComplete(body.enrollmentId, body.lessonId);
  }

  // Certificates
  @Get('certificates/:userId')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Get certificates by user (Admin can see all, Instructor can see students in their courses, Student can see own)' })
  @ApiResponse({ status: 200, description: 'Certificates retrieved successfully' })
  getCertificatesByUser(@Param('userId') userId: string, @CurrentUser() user: UserFromJwt) {
    return this.enrollmentsService.getCertificatesByUser(userId, user);
  }

  @Post('certificates')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  issueCertificate(@Body() body: IssueCertificateDto) {
    return this.enrollmentsService.issueCertificate(body.userId, body.courseId, body.certificateUrl);
  }
}
