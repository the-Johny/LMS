export class CourseService {
  constructor(private prisma: PrismaClient) {}

  async createCourse(createCourseDto: CreateCourseDto): Promise<CourseResponseDto> {
    const course = await this.prisma.course.create({
      data: {
        ...createCourseDto,
        id: crypto.randomUUID()
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return this.mapToCourseResponse(course);
  }

  async findAllCourses(queryDto: CourseQueryDto): Promise<{
    courses: CourseListDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 10, category, level, search, instructorId, isPublished } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (category) where.category = category;
    if (level) where.level = level;
    if (instructorId) where.instructorId = instructorId;
    if (isPublished !== undefined) where.isPublished = isPublished;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: {
            select: {
              id: true,
              name: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      this.prisma.course.count({ where })
    ]);

    return {
      courses: courses.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        level: course.level,
        category: course.category,
        isPublished: course.isPublished,
        instructor: course.instructor,
        createdAt: course.createdAt,
        enrollmentCount: course._count.enrollments
      })),
      total,
      page,
      limit
    };
  }

  async findCourseById(id: string): Promise<CourseResponseDto | null> {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        modules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) return null;

    return this.mapToCourseResponse(course);
  }

  async updateCourse(id: string, updateCourseDto: UpdateCourseDto): Promise<CourseResponseDto | null> {
    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: updateCourseDto,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return this.mapToCourseResponse(course);
    } catch (error) {
      return null;
    }
  }

  async deleteCourse(id: string): Promise<boolean> {
    try {
      await this.prisma.course.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getCoursesByInstructor(instructorId: string): Promise<CourseListDto[]> {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      level: course.level,
      category: course.category,
      isPublished: course.isPublished,
      instructor: course.instructor,
      createdAt: course.createdAt,
      enrollmentCount: course._count.enrollments
    }));
  }

  private mapToCourseResponse(course: any): CourseResponseDto {
    return {
      id: course.id,
      title: course.title,
      description: course.description,
      objectives: course.objectives,
      prerequisites: course.prerequisites,
      level: course.level,
      category: course.category,
      isPublished: course.isPublished,
      instructorId: course.instructorId,
      instructor: course.instructor,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      modules: course.modules?.map(module => ({
        id: module.id,
        title: module.title,
        courseId: module.courseId,
        lessons: module.lessons,
        lessonCount: module.lessons?.length || 0
      })),
      enrollmentCount: course._count?.enrollments
    };
  }
}

export class ModuleService {
  constructor(private prisma: PrismaClient) {}

  async createModule(createModuleDto: CreateModuleDto): Promise<ModuleResponseDto> {
    const module = await this.prisma.module.create({
      data: {
        ...createModuleDto,
        id: crypto.randomUUID()
      },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return this.mapToModuleResponse(module);
  }

  async findAllModules(): Promise<ModuleResponseDto[]> {
    const modules = await this.prisma.module.findMany({
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return modules.map(module => this.mapToModuleResponse(module));
  }

  async findModuleById(id: string): Promise<ModuleResponseDto | null> {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!module) return null;

    return this.mapToModuleResponse(module);
  }

  async findModulesByCourse(courseId: string): Promise<ModuleResponseDto[]> {
    const modules = await this.prisma.module.findMany({
      where: { courseId },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        },
        lessons: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    return modules.map(module => this.mapToModuleResponse(module));
  }

  async updateModule(id: string, updateModuleDto: UpdateModuleDto): Promise<ModuleResponseDto | null> {
    try {
      const module = await this.prisma.module.update({
        where: { id },
        data: updateModuleDto,
        include: {
          course: {
            select: {
              id: true,
              title: true
            }
          },
          lessons: {
            orderBy: {
              order: 'asc'
            }
          }
        }
      });

      return this.mapToModuleResponse(module);
    } catch (error) {
      return null;
    }
  }

  async deleteModule(id: string): Promise<boolean> {
    try {
      await this.prisma.module.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private mapToModuleResponse(module: any): ModuleResponseDto {
    return {
      id: module.id,
      title: module.title,
      courseId: module.courseId,
      course: module.course,
      lessons: module.lessons,
      lessonCount: module.lessons?.length || 0
    };
  }
