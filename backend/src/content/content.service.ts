/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { CreateCourseDto, CreateLessonDto, UpdateCourseDto, UpdateLessonDto, UpdateModuleDto } from './dtos/content.dto';

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
  async createCourse(data: CreateCourseDto) {
    return this.prisma.course.create({ data });
  }
  async updateCourse(id: string, data: UpdateCourseDto) {
    return this.prisma.course.update({ where: { id }, data });
  }
  async deleteCourse(id: string) {
    return this.prisma.course.delete({ where: { id } });
  }

  // Modules
  async getModulesByCourse(courseId: string) {
    return this.prisma.module.findMany({ where: { courseId } });
  }
  async createModule(data: any) {
    return this.prisma.module.create({ data });
  }
  async updateModule(id: string, data: UpdateModuleDto) {
    return this.prisma.module.update({ where: { id }, data });
  }
  async deleteModule(id: string) {
    return this.prisma.module.delete({ where: { id } });
  }

  // Lessons
  async getLessonsByModule(moduleId: string) {
    return this.prisma.lesson.findMany({ where: { moduleId } });
  }
  async createLesson(data: CreateLessonDto) {
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
  async updateLesson(id: string, data: UpdateLessonDto) {
    return this.prisma.lesson.update({ where: { id }, data });
  }
  async deleteLesson(id: string) {
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
    // Download file as a buffer
    const buffer = await this.downloadFileBuffer(url);
    // Get file extension
    const ext = path.extname(url).toLowerCase();
    // Allowed file types
    const allowed = ['.pdf', '.doc', '.docx', '.mp4', '.avi', '.mov', '.wmv', '.mkv'];
    if (!allowed.includes(ext)) {
      throw new Error('File type not allowed. Only PDF, Word, and video files are supported.');
    }
    // Upload to Cloudinary
    return this.cloudinaryService.uploadFileBuffer(buffer, folder);
  }
}
