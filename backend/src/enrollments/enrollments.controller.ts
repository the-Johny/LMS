/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Delete, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollUserDto, MarkLessonCompleteDto, IssueCertificateDto } from './dtos/enrollments.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  // Enrollments
  @Post()
  enrollUser(@Body() body: EnrollUserDto) {
    return this.enrollmentsService.enrollUser(body.userId, body.courseId);
  }

  @Get('user/:userId')
  getEnrollmentsByUser(@Param('userId') userId: string) {
    return this.enrollmentsService.getEnrollmentsByUser(userId);
  }

  @Get('course/:courseId')
  getEnrollmentsByCourse(@Param('courseId') courseId: string) {
    return this.enrollmentsService.getEnrollmentsByCourse(courseId);
  }

  @Delete(':enrollmentId')
  unenrollUser(@Param('enrollmentId') enrollmentId: string) {
    return this.enrollmentsService.unenrollUser(enrollmentId);
  }

  // Progress
  @Get(':enrollmentId/progress')
  getProgress(@Param('enrollmentId') enrollmentId: string) {
    return this.enrollmentsService.getProgress(enrollmentId);
  }

  @Post('progress/complete')
  markLessonComplete(@Body() body: MarkLessonCompleteDto) {
    return this.enrollmentsService.markLessonComplete(body.enrollmentId, body.lessonId);
  }

  // Certificates
  @Get('certificates/:userId')
  getCertificatesByUser(@Param('userId') userId: string) {
    return this.enrollmentsService.getCertificatesByUser(userId);
  }

  @Post('certificates')
  issueCertificate(@Body() body: IssueCertificateDto) {
    return this.enrollmentsService.issueCertificate(body.userId, body.courseId, body.certificateUrl);
  }
}
