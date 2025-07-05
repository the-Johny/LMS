/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  // Enrollments
  async enrollUser(userId: string, courseId: string) {
    return this.prisma.enrollment.create({ data: { userId, courseId } });
  }
  async getEnrollmentsByUser(userId: string) {
    return this.prisma.enrollment.findMany({ where: { userId } });
  }
  async getEnrollmentsByCourse(courseId: string) {
    return this.prisma.enrollment.findMany({ where: { courseId } });
  }
  async unenrollUser(enrollmentId: string) {
    return this.prisma.enrollment.delete({ where: { id: enrollmentId } });
  }

  // Progress
  async getProgress(enrollmentId: string) {
    return this.prisma.progress.findMany({ where: { enrollmentId } });
  }
  async markLessonComplete(enrollmentId: string, lessonId: string) {
    return this.prisma.progress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId, lessonId } },
      update: { completed: true },
      create: { enrollmentId, lessonId, completed: true },
    });
  }

  // Certificates
  async getCertificatesByUser(userId: string) {
    return this.prisma.certificate.findMany({ where: { userId } });
  }
  async issueCertificate(userId: string, courseId: string, certificateUrl: string) {
    return this.prisma.certificate.create({ data: { userId, courseId, certificateUrl } });
  }
}
