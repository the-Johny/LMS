/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Role } from '@prisma/client';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    const { instructorId, ...courseData } = createCourseDto;
    const data = {
      ...courseData,
      instructorId: instructorId || null,
    };
    return this.prisma.course.create({ data });
  }

  async findAll() {
    return this.prisma.course.findMany();
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update your own courses');
    }

    return this.prisma.course.update({ where: { id }, data: updateCourseDto });
  }

  async remove(id: string, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    return this.prisma.course.delete({ where: { id } });
  }

  async assignInstructor(courseId: string, instructorId: string) {
    // Check if course exists
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    // Check if instructor exists
    const instructor = await this.prisma.user.findUnique({
      where: { id: instructorId },
    });
    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    // Verify instructor has INSTRUCTOR role
    if (instructor.role !== Role.INSTRUCTOR) {
      throw new ForbiddenException(
        'User must have INSTRUCTOR role to be assigned to a course',
      );
    }

    return this.prisma.course.update({
      where: { id: courseId },
      data: { instructorId },
    });
  }
}
