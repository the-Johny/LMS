/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, ValidationPipe, BadRequestException } from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateCourseDto, UpdateCourseDto, CreateModuleDto, UpdateModuleDto, CreateLessonDto, UpdateLessonDto } from './dtos/content.dto';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('content')
export class ContentController {
  constructor(
    private readonly contentService: ContentService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // Courses
  @Get('courses')
  getAllCourses() {
    return this.contentService.getAllCourses();
  }

  @Get('courses/:id')
  getCourseById(@Param('id') id: string) {
    return this.contentService.getCourseById(id);
  }

  @Post('courses')
  createCourse(@Body() data: CreateCourseDto) {
    return this.contentService.createCourse(data);
  }

  @Put('courses/:id')
  updateCourse(@Param('id') id: string, @Body() data: UpdateCourseDto) {
    return this.contentService.updateCourse(id, data);
  }

  @Delete('courses/:id')
  deleteCourse(@Param('id') id: string) {
    return this.contentService.deleteCourse(id);
  }

  // Modules
  @Get('courses/:courseId/modules')
  getModulesByCourse(@Param('courseId') courseId: string) {
    return this.contentService.getModulesByCourse(courseId);
  }

  @Post('modules')
  createModule(@Body() data: CreateModuleDto) {
    return this.contentService.createModule(data);
  }

  @Put('modules/:id')
  updateModule(@Param('id') id: string, @Body() data: UpdateModuleDto) {
    return this.contentService.updateModule(id, data);
  }

  @Delete('modules/:id')
  deleteModule(@Param('id') id: string) {
    return this.contentService.deleteModule(id);
  }

  // Lessons
  @Get('modules/:moduleId/lessons')
  getLessonsByModule(@Param('moduleId') moduleId: string) {
    return this.contentService.getLessonsByModule(moduleId);
  }

  @Post('lessons')
  createLesson(@Body() data: CreateLessonDto) {
    return this.contentService.createLesson(data);
  }

  @Put('lessons/:id')
  updateLesson(@Param('id') id: string, @Body() data: UpdateLessonDto) {
    return this.contentService.updateLesson(id, data);
  }

  @Delete('lessons/:id')
  deleteLesson(@Param('id') id: string) {
    return this.contentService.deleteLesson(id);
  }

  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadContentFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const result = await this.cloudinaryService.uploadFileBuffer(file.buffer, 'content-files');
    return { url: result.secure_url };
  }

  @Post('upload-certificate')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificateFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { error: 'No file uploaded' };
    }
    const result = await this.cloudinaryService.uploadFileBuffer(file.buffer, 'certificate-files');
    return { url: result.secure_url };
  }

  @Post('upload-file-from-url')
  async uploadFileFromUrl(@Body() body: { url: string; type?: string }) {
    const { url, type } = body;
    if (!url) {
      throw new BadRequestException('No URL provided');
    }
    let folder = 'content-files';
    if (type === 'certificate') folder = 'certificate-files';
    if (type === 'video') folder = 'video-files';
    try {
      const result = await this.contentService.uploadFileFromUrl(url, folder);
      return { url: result.secure_url };
    } catch (e) {
      return { error: e.message || 'Upload failed' };
    }
  }
}
