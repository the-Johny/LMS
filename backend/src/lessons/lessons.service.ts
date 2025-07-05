import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLessonDto: CreateLessonDto, user: any) {
    // Check if user is instructor of the course or admin
    const module = await this.prisma.module.findUnique({
      where: { id: createLessonDto.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (user.role !== 'ADMIN' && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create lessons for your own courses');
    }

    return this.prisma.lesson.create({ data: createLessonDto });
  }

  async findByModule(moduleId: string) {
    return this.prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
    });
    
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    
    return lesson;
  }

  async update(id: string, updateLessonDto: UpdateLessonDto, user: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (user.role !== 'ADMIN' && lesson.module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update lessons for your own courses');
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: string, user: any) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (user.role !== 'ADMIN' && lesson.module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete lessons for your own courses');
    }

    return this.prisma.lesson.delete({ where: { id } });
  }
} 