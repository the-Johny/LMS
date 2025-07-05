/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // Enrollments
  async enrollUser(userId: string, courseId: string) {
    console.log('EnrollmentsService.enrollUser', { userId, courseId });
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }
  async getEnrollmentsByUser(userId: string) {
    console.log('EnrollmentsService.getEnrollmentsByUser', { userId });
    return this.prisma.enrollment.findMany({ where: { userId } });
  }
  async getEnrollmentsByCourse(courseId: string) {
    console.log('EnrollmentsService.getEnrollmentsByCourse', { courseId });
    return this.prisma.enrollment.findMany({ where: { courseId } });
  }
  async getAllEnrollments() {
    console.log('EnrollmentsService.getAllEnrollments');
    return this.prisma.enrollment.findMany({
      include: {
        user: true,
        course: true,
      },
    });
  }
  async unenrollUser(enrollmentId: string) {
    console.log('EnrollmentsService.unenrollUser', { enrollmentId });
    return this.prisma.enrollment.delete({ where: { id: enrollmentId } });
  }

  // Progress
  async getProgress(enrollmentId: string) {
    console.log('EnrollmentsService.getProgress', { enrollmentId });
    return this.prisma.progress.findMany({ where: { enrollmentId } });
  }
  async markLessonComplete(enrollmentId: string, lessonId: string) {
    console.log('EnrollmentsService.markLessonComplete', { enrollmentId, lessonId });
    return this.prisma.progress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: { completed: true },
      create: { enrollmentId, lessonId, completed: true },
    });
  }

  // Certificates
  async getCertificatesByUser(userId: string) {
    console.log('EnrollmentsService.getCertificatesByUser', { userId });
    return this.prisma.certificate.findMany({ where: { userId } });
  }
  async issueCertificate(userId: string, courseId: string, certificateUrl: string) {
    console.log('EnrollmentsService.issueCertificate', { userId, courseId, certificateUrl });
    return this.prisma.certificate.create({ data: { userId, courseId, certificateUrl } });
  }
}
