/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('cloudinary')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CloudinaryController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('upload/lesson')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadLessonContent(
    @UploadedFile() file: Express.Multer.File,
    @Body('lessonId') lessonId: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadFileBuffer(
      file.buffer,
      'lessons',
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  }

  @Post('upload/certificate')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @UseInterceptors(FileInterceptor('file'))
  async uploadCertificate(
    @UploadedFile() file: Express.Multer.File,
    @Body('certificateId') certificateId: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.cloudinaryService.uploadFileBuffer(
      file.buffer,
      'certificates',
    );

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  }

  @Post('upload/url')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  async uploadFromUrl(
    @Body('url') url: string,
    @Body('folder') folder: string,
    @Body('publicId') publicId?: string,
  ) {
    const result = await this.cloudinaryService.uploadFromUrl(url, folder, publicId);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  }
} 