/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
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

  async getDashboardStats() {
    const [
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      recentEnrollments,
      topCourses
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.certificate.count(),
      this.prisma.enrollment.count({
        where: {
          enrolledAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      this.prisma.course.findMany({
        take: 5,
        orderBy: {
          enrollments: { _count: 'desc' }
        },
        include: {
          _count: { select: { enrollments: true } }
        }
      })
    ]);

    return {
      totalUsers,
      totalCourses,
      totalEnrollments,
      totalCertificates,
      recentEnrollments,
      topCourses: topCourses.map(course => ({
        id: course.id,
        title: course.title,
        enrollmentCount: course._count.enrollments
      }))
    };
  }

  async getCourseEngagement(courseId: string, period: string = 'month') {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const [enrollments, completions, reviews] = await Promise.all([
      this.prisma.enrollment.count({
        where: {
          courseId,
          enrolledAt: { gte: startDate }
        }
      }),
      this.prisma.progress.count({
        where: {
          enrollment: { courseId },
          completed: true,
          // Note: Progress doesn't have timestamp, so we'll count all completions
        }
      }),
      this.prisma.review.count({
        where: {
          courseId,
          createdAt: { gte: startDate }
        }
      })
    ]);

    return {
      courseId,
      period,
      enrollments,
      completions,
      reviews,
      engagementScore: Math.round((completions / Math.max(enrollments, 1)) * 100)
    };
  }

  async getStudentLearningPath(userId: string) {
    const userEnrollments = await this.prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: { lessons: true }
            }
          }
        },
        progress: true
      }
    });

    const completedCourses = userEnrollments.filter(enrollment => {
      const totalLessons = enrollment.course.modules.flatMap(m => m.lessons).length;
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      return completedLessons === totalLessons && totalLessons > 0;
    });

    const inProgressCourses = userEnrollments.filter(enrollment => {
      const totalLessons = enrollment.course.modules.flatMap(m => m.lessons).length;
      const completedLessons = enrollment.progress.filter(p => p.completed).length;
      return completedLessons > 0 && completedLessons < totalLessons;
    });

    // Get recommended courses based on completed categories
    const completedCategories = completedCourses.map(enrollment => enrollment.course.category);
    const uniqueCategories = [...new Set(completedCategories)];

    const recommendedCourses = await this.prisma.course.findMany({
      where: {
        category: { in: uniqueCategories },
        isPublished: true,
        enrollments: {
          none: { userId }
        }
      },
      take: 5,
      include: {
        _count: { select: { enrollments: true, reviews: true } }
      }
    });

    return {
      userId,
      completedCourses: completedCourses.length,
      inProgressCourses: inProgressCourses.length,
      totalEnrollments: userEnrollments.length,
      completedCategories: uniqueCategories,
      recommendedCourses: recommendedCourses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        level: course.level,
        enrollmentCount: course._count.enrollments,
        reviewCount: course._count.reviews
      }))
    };
  }

  async getModuleProgress(courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: true,
            moduleProgress: true
          }
        },
        enrollments: {
          include: { progress: true }
        }
      }
    });

    if (!course) {
      throw new Error(`Course with ID ${courseId} not found`);
    }

    return course.modules.map(module => {
      const totalLessons = module.lessons.length;
      const totalEnrollments = course.enrollments.length;
      
      const completedLessons = course.enrollments.reduce((total, enrollment) => {
        return total + enrollment.progress.filter(p => 
          p.completed && module.lessons.some(lesson => lesson.id === p.lessonId)
        ).length;
      }, 0);

      const completionRate = totalEnrollments > 0 
        ? Math.round((completedLessons / (totalLessons * totalEnrollments)) * 100)
        : 0;

      return {
        moduleId: module.id,
        moduleTitle: module.title,
        totalLessons,
        totalEnrollments,
        completedLessons,
        completionRate
      };
    });
  }

  async getTimeSpentAnalytics(userId: string, courseId?: string) {
    const whereClause: any = { userId };
    if (courseId) {
      whereClause.enrollment = { courseId };
    }

    const progress = await this.prisma.progress.findMany({
      where: whereClause,
      include: {
        enrollment: {
          include: {
            course: true
          }
        },
        lesson: true
      }
    });

    // Group by course
    const courseAnalytics = progress.reduce((acc, p) => {
      const courseId = p.enrollment.courseId;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseTitle: p.enrollment.course.title,
          totalLessons: 0,
          completedLessons: 0,
          estimatedTimeSpent: 0
        };
      }
      
      acc[courseId].totalLessons++;
      if (p.completed) {
        acc[courseId].completedLessons++;
        acc[courseId].estimatedTimeSpent += 30;
      }
      
      return acc;
    }, {});

    return {
      userId,
      courseId,
      analytics: Object.values(courseAnalytics),
      totalEstimatedTime: Object.values(courseAnalytics).reduce((sum: number, course: any) => sum + course.estimatedTimeSpent, 0)
    };
  }

  async getCertificateStats(instructorId?: string) {
    const whereClause: any = {};
    if (instructorId) {
      whereClause.course = { instructorId };
    }

    const [totalCertificates, recentCertificates, certificatesByMonth] = await Promise.all([
      this.prisma.certificate.count({ where: whereClause }),
      this.prisma.certificate.count({
        where: {
          ...whereClause,
          issuedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      }),
      this.prisma.certificate.groupBy({
        by: ['issuedAt'],
        where: whereClause,
        _count: true
      })
    ]);

    return {
      totalCertificates,
      recentCertificates,
      certificatesByMonth: certificatesByMonth.map(entry => ({
        month: entry.issuedAt.toISOString().slice(0, 7), // YYYY-MM format
        count: entry._count
      }))
    };
  }
}
