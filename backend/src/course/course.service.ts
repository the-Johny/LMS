import { Injectable } from '@nestjs/common';
import { Category, Level } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { CourseQueryDto } from './dtos/course-query.dto';
import { CourseResponseDto } from './dtos/course-response.dto';
import { CourseListDto } from './dtos/course-list.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  async createCourse(
    createCourseDto: CreateCourseDto,
  ): Promise<CourseResponseDto> {
    const course = await this.prisma.course.create({
      data: {
        id: uuidv4(),
        ...createCourseDto,
      },
      include: {
        instructor: true,
      },
    });

    return this.mapToCourseResponse(course);
  }

  async findAllCourses(queryDto: CourseQueryDto): Promise<CourseListDto> {
    const {
      page = 1,
      limit = 10,
      category,
      level,
      search,
      instructorId,
      isPublished,
    } = queryDto;

    const skip = (page - 1) * limit;

    const where: Record<string, any> = {};
    if (category) where.category = category;
    if (level) where.level = level;
    if (instructorId) where.instructorId = instructorId;
    if (typeof isPublished === 'boolean') where.isPublished = isPublished;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await this.prisma.$transaction([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: true,
          _count: { select: { enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((course) => this.mapToCourseResponse(course)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findCourseById(id: string): Promise<CourseResponseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true,
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    return course ? this.mapToCourseResponse(course) : null;
  }

  async updateCourse(
    id: string,
    dto: UpdateCourseDto,
  ): Promise<CourseResponseDto | null> {
    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: dto,
        include: {
          instructor: true,
        },
      });

      return this.mapToCourseResponse(course);
    } catch {
      return null;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      await this.prisma.course.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async getCoursesByInstructor(
    instructorId: string,
  ): Promise<CourseResponseDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return courses.map((course) => this.mapToCourseResponse(course));
  }

  private mapToCourseResponse(course: {
    id: string;
    title: string;
    description: string;
    objectives?: string[];
    prerequisites?: string[];
    level: string;
    category: string;
    isPublished: boolean;
    instructorId: string;
    instructor?: { name?: string };
    createdAt: Date;
    updatedAt: Date;
    _count?: { enrollments: number };
    averageRating?: number | null;
    modules?: any[];
  }): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      objectives: course.objectives || [],
      prerequisites: course.prerequisites || [],
      level: course.level as Level,
      category: course.category as Category,
      isPublished: course.isPublished,
      instructorId: course.instructorId,
      instructorName: course.instructor?.name || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      enrollmentCount: course._count?.enrollments ?? 0,
      averageRating: course.averageRating ?? undefined,
      moduleCount: course.modules?.length ?? 0,
    };
  }
}
