import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { MarkCompleteDto } from './dto/mark-complete.dto';
import { UserProgressDto } from './dto/user-progress.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  async markLessonComplete(dto: MarkCompleteDto) {
    const { enrollmentId, lessonId } = dto;

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');

    await this.prisma.progress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        enrollmentId,
        lessonId,
        completed: true,
      },
    });
  }

  async getUserCourseProgress(enrollmentId: string): Promise<UserProgressDto> {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
      },
    });

    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const allLessons = enrollment.course.modules.flatMap((mod) => mod.lessons);
    const totalLessons = allLessons.length;

    const completedCount = await this.prisma.progress.count({
      where: {
        enrollmentId,
        completed: true,
      },
    });

    return {
      courseId: enrollment.courseId,
      completedLessons: completedCount,
      totalLessons,
      progressPercentage: totalLessons
        ? Math.round((completedCount / totalLessons) * 100)
        : 0,
    };
  }
}
