import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { StudentProgressDto } from './dtos/student-progress.dto';
import { CourseCompletionRateDto } from './dtos/course-completion-rate.dto';
import { PopularCourseDto } from './dtos/popular-course.dto';
import { InstructorCourseStatsDto } from './dtos/instructor-stats.dto';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getStudentProgress(userId: string): Promise<StudentProgressDto[]> {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true },
            },
          },
        },
        progress: true,
      },
    });

    return enrollments.map((enroll) => {
      const totalLessons = enroll.course.modules.flatMap(
        (m) => m.lessons,
      ).length;
      const completedLessons = enroll.progress.filter(
        (p) => p.completed,
      ).length;
      const progressPercentage = totalLessons
        ? Math.round((completedLessons / totalLessons) * 100)
        : 0;

      return {
        courseId: enroll.course.id,
        courseTitle: enroll.course.title,
        completedLessons,
        totalLessons,
        progressPercentage,
      };
    });
  }

  async getCourseCompletionRate(
    courseId: string,
  ): Promise<CourseCompletionRateDto> {
    const totalEnrollments = await this.prisma.enrollment.count({
      where: { courseId },
    });

    if (totalEnrollments === 0) {
      return { courseId, courseTitle: '', completionRate: 0 };
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    const totalLessons = course.modules.flatMap((m) => m.lessons).length;

    const completedEnrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      include: { progress: true },
    });

    const fullyCompleted = completedEnrollments.filter((enroll) => {
      return enroll.progress.filter((p) => p.completed).length === totalLessons;
    }).length;

    const completionRate = Math.round(
      (fullyCompleted / totalEnrollments) * 100,
    );

    return {
      courseId,
      courseTitle: course.title,
      completionRate,
    };
  }
  async getPopularCourses(limit = 5): Promise<PopularCourseDto[]> {
    const courses = await this.prisma.course.findMany({
      orderBy: {
        enrollments: { _count: 'desc' },
      },
      take: limit,
      include: {
        _count: { select: { enrollments: true } },
      },
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      enrollmentCount: course._count.enrollments,
    }));
  }

  async getInstructorStats(
    instructorId: string,
  ): Promise<InstructorCourseStatsDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: { select: { enrollments: true, reviews: true } },
        reviews: true,
      },
    });

    return courses.map((course) => {
      const avgRating =
        course.reviews.reduce((sum, r) => sum + r.rating, 0) /
        (course.reviews.length || 1);

      return {
        courseId: course.id,
        title: course.title,
        students: course._count.enrollments,
        reviews: course._count.reviews,
        averageRating: Number(avgRating.toFixed(1)),
      };
    });
  }
}
