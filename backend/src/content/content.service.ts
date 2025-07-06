/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { CreateCourseDto, UpdateCourseDto } from '../courses/dto/course.dto';
import { CreateModuleDto, UpdateModuleDto } from '../modules/dto/module.dto';
import { CreateLessonDto, UpdateLessonDto } from '../lessons/dto/lesson.dto';
import { Role } from '@prisma/client';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private cloudinaryService: CloudinaryService,
  ) {}
 
  // Courses
  async getAllCourses() {
    return this.prisma.course.findMany();
  }
  async getCourseById(id: string) {
    return this.prisma.course.findUnique({ where: { id } });
  }
  async createCourse(createCourseDto: CreateCourseDto, user: UserFromJwt) {
    const { instructorId, ...courseData } = createCourseDto;
    const data = {
      ...courseData,
      instructorId: instructorId || null
    };
    return this.prisma.course.create({ data });
  }
  async updateCourse(id: string, data: UpdateCourseDto, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update your own courses');
    }
    return this.prisma.course.update({ where: { id }, data });
  }
  async deleteCourse(id: string, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }
    return this.prisma.course.delete({ where: { id } });
  }

  // Modules
  async getModulesByCourse(courseId: string) {
    return this.prisma.module.findMany({ where: { courseId } });
  }
  async createModule(data: CreateModuleDto, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id: data.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create modules for your own courses');
    }
    return this.prisma.module.create({ data });
  }
  async updateModule(id: string, data: UpdateModuleDto, user: UserFromJwt) {
    const module = await this.prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!module) throw new NotFoundException('Module not found');
    if (user.role !== Role.ADMIN && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update modules for your own courses');
    }
    return this.prisma.module.update({ where: { id }, data });
  }
  async deleteModule(id: string, user: UserFromJwt) {
    const module = await this.prisma.module.findUnique({ where: { id }, include: { course: true } });
    if (!module) throw new NotFoundException('Module not found');
    if (user.role !== Role.ADMIN && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete modules for your own courses');
    }
    return this.prisma.module.delete({ where: { id } });
  }

  // Lessons
  async getLessonsByModule(moduleId: string) {
    return this.prisma.lesson.findMany({ where: { moduleId } });
  }
  async createLesson(data: CreateLessonDto, user: UserFromJwt) {
    const module = await this.prisma.module.findUnique({ where: { id: data.moduleId }, include: { course: true } });
    if (!module) throw new NotFoundException('Module not found');
    if (user.role !== Role.ADMIN && module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create lessons for your own courses');
    }
    // If contentUrl is a remote URL (http/https), upload to Cloudinary first
    if (typeof data.contentUrl === 'string' && (data.contentUrl.startsWith('http://') || data.contentUrl.startsWith('https://'))) {
      const ext = path.extname(data.contentUrl).toLowerCase();
      const allowed = ['.pdf', '.doc', '.docx', '.mp4', '.avi', '.mov', '.wmv', '.mkv'];
      if (!allowed.includes(ext)) {
        throw new Error('File type not allowed. Only PDF, Word, and video files are supported.');
      }
      const buffer = await this.downloadFileBuffer(data.contentUrl);
      const result = await this.cloudinaryService.uploadFileBuffer(buffer, 'content-files');
      data.contentUrl = result.secure_url;
    }
    return this.prisma.lesson.create({ data });
  }
  async updateLesson(id: string, data: UpdateLessonDto, user: UserFromJwt) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (user.role !== Role.ADMIN && lesson.module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update lessons for your own courses');
    }
    return this.prisma.lesson.update({ where: { id }, data });
  }
  async deleteLesson(id: string, user: UserFromJwt) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id }, include: { module: { include: { course: true } } } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (user.role !== Role.ADMIN && lesson.module.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete lessons for your own courses');
    }
    return this.prisma.lesson.delete({ where: { id } });
  }

  // Helper to download a file as a buffer using http/https
  private downloadFileBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      client.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`Failed to get file. Status code: ${res.statusCode}`));
          return;
        }
        const data: Uint8Array[] = [];
        res.on('data', (chunk) => data.push(chunk));
        res.on('end', () => resolve(Buffer.concat(data)));
      }).on('error', reject);
    });
  }

  // Upload file from remote URL and allow only PDF, Word, and video files
  async uploadFileFromUrl(url: string, folder: string) {
    const buffer = await this.downloadFileBuffer(url);
    const ext = path.extname(url).toLowerCase();
    const allowed = ['.pdf', '.doc', '.docx', '.mp4', '.avi', '.mov', '.wmv', '.mkv'];
    if (!allowed.includes(ext)) {
      throw new Error('File type not allowed. Only PDF, Word, and video files are supported.');
    }
    return this.cloudinaryService.uploadFileBuffer(buffer, folder);
  }
}
