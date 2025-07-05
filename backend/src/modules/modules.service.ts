import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, UpdateModuleDto } from './dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createModuleDto: CreateModuleDto, user: any) {
    // Check if user is instructor of the course or admin
    const course = await this.prisma.course.findUnique({
      where: { id: createModuleDto.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== 'ADMIN' && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create modules for your own courses');
    }

    return this.prisma.module.create({ data: createModuleDto });
  }

  async findByCourse(courseId: string) {
    return this.prisma.module.findMany({
      where: { courseId },
      include: { lessons: true },
    });
  }

  async findOne(id: string) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { lessons: true },
    });
    
    if (!module) {
      throw new NotFoundException('Module not found');
    }
    
    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto, user: any) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (user.role !== 'ADMIN' && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update modules for your own courses');
    }

    return this.prisma.module.update({
      where: { id },
      data: updateModuleDto,
    });
  }

  async remove(id: string, user: any) {
    const module = await this.prisma.module.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (user.role !== 'ADMIN' && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete modules for your own courses');
    }

    return this.prisma.module.delete({ where: { id } });
  }
} 