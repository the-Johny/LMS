/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createLessonDto: CreateLessonDto, user: UserFromJwt) {
    // Check if user is instructor of the course or admin
    const module = await this.prisma.module.findUnique({
      where: { id: createLessonDto.moduleId },
      include: { course: true },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    if (user.role !== 'ADMIN' && module.course.instructorId !== user.userId) {
      throw new ForbiddenException(
        'You can only create lessons for your own courses',
      );
    }

    // Create the lesson first to get the ID
    const lesson = await this.prisma.lesson.create({ data: createLessonDto });

    // If the content URL is not already a Cloudinary URL, upload it to Cloudinary
    if (!this.cloudinaryService.isCloudinaryUrl(createLessonDto.contentUrl)) {
      try {
        const cloudinaryResult = await this.cloudinaryService.uploadLessonContent(
          createLessonDto.contentUrl,
          lesson.id,
        );
        
        // Update the lesson with the Cloudinary URL
        await this.prisma.lesson.update({
          where: { id: lesson.id },
          data: { contentUrl: cloudinaryResult.secure_url },
        });

        return {
          ...lesson,
          contentUrl: cloudinaryResult.secure_url,
        };
      } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        // If Cloudinary upload fails, return the lesson with original URL
        return lesson;
      }
    }

    return lesson;
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

  async update(id: string, updateLessonDto: UpdateLessonDto, user: UserFromJwt) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (
      user.role !== 'ADMIN' &&
      lesson.module.course.instructorId !== user.userId
    ) {
      throw new ForbiddenException(
        'You can only update lessons for your own courses',
      );
    }

    // If contentUrl is being updated and it's not a Cloudinary URL
    if (updateLessonDto.contentUrl && !this.cloudinaryService.isCloudinaryUrl(updateLessonDto.contentUrl)) {
      try {
        // Delete the old Cloudinary file if it exists
        if (this.cloudinaryService.isCloudinaryUrl(lesson.contentUrl)) {
          await this.cloudinaryService.deleteLessonContent(lesson.id);
        }

        // Upload the new content to Cloudinary
        const cloudinaryResult = await this.cloudinaryService.uploadLessonContent(
          updateLessonDto.contentUrl,
          lesson.id,
        );
        
        updateLessonDto.contentUrl = cloudinaryResult.secure_url;
      } catch (error) {
        console.error('Error updating Cloudinary content:', error);
        // Continue with the update even if Cloudinary fails
      }
    }

    return this.prisma.lesson.update({
      where: { id },
      data: updateLessonDto,
    });
  }

  async remove(id: string, user: UserFromJwt) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    if (
      user.role !== 'ADMIN' &&
      lesson.module.course.instructorId !== user.userId
    ) {
      throw new ForbiddenException(
        'You can only delete lessons for your own courses',
      );
    }

    // Delete the Cloudinary file if it exists
    if (this.cloudinaryService.isCloudinaryUrl(lesson.contentUrl)) {
      try {
        await this.cloudinaryService.deleteLessonContent(lesson.id);
      } catch (error) {
        console.error('Error deleting Cloudinary content:', error);
        // Continue with deletion even if Cloudinary deletion fails
      }
    }

    return this.prisma.lesson.delete({ where: { id } });
  }

  async uploadLessonFile(file: Express.Multer.File, lessonId: string) {
    if (!file || !file.buffer) {
      throw new Error('No file buffer provided');
    }
    return this.cloudinaryService.uploadFileBuffer(file.buffer, 'lessons', file.mimetype);
  }
}
