/* eslint-disable prettier/prettier */
import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class EnrollmentsService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}

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
    return this.prisma.enrollment.findMany({
      where: { courseId },
      include: { user: true }
    });
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
  async getCertificatesByUser(userId: string, user: UserFromJwt) {
    console.log('EnrollmentsService.getCertificatesByUser', { userId, user });
    // Students can only see their own certificates
    if (user.role === 'STUDENT' && user.userId !== userId) {
      throw new ForbiddenException('You can only view your own certificates');
    }
    // Instructors can only see certificates for students in their courses
    if (user.role === 'INSTRUCTOR') {
      const certificates = await this.prisma.certificate.findMany({
        where: { userId },
        include: {
          user: true,
          course: true
        }
      });
      // Filter certificates to only include those from courses the instructor teaches
      const filteredCertificates = certificates.filter(certificate => 
        certificate.course.instructorId === user.userId
      );
      if (filteredCertificates.length === 0 && certificates.length > 0) {
        throw new ForbiddenException('You can only view certificates for students in your courses');
      }
      return filteredCertificates;
    }
    // Admins can see all certificates
    return this.prisma.certificate.findMany({ 
      where: { userId },
      include: {
        user: true,
        course: true
      }
    });
  }
  
  async issueCertificate(userId: string, courseId: string, certificateUrl: string) {
    console.log('EnrollmentsService.issueCertificate', { userId, courseId, certificateUrl });
    
    // Create the certificate first to get the ID
    const certificate = await this.prisma.certificate.create({ 
      data: { userId, courseId, certificateUrl } 
    });

    // If the certificate URL is not already a Cloudinary URL, upload it to Cloudinary
    if (!this.cloudinaryService.isCloudinaryUrl(certificateUrl)) {
      try {
        const cloudinaryResult = await this.cloudinaryService.uploadCertificate(
          certificateUrl,
          certificate.id,
        );
        
        // Update the certificate with the Cloudinary URL
        await this.prisma.certificate.update({
          where: { id: certificate.id },
          data: { certificateUrl: cloudinaryResult.secure_url },
        });

        return {
          ...certificate,
          certificateUrl: cloudinaryResult.secure_url,
        };
      } catch (error) {
        console.error('Error uploading certificate to Cloudinary:', error);
        // If Cloudinary upload fails, return the certificate with original URL
        return certificate;
      }
    }

    return certificate;
  }
}
