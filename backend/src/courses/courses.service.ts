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
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createCourseDto: CreateCourseDto) {
    const { instructorId, imageUrl, ...courseData } = createCourseDto;
    
    let cloudinaryData = {};
    
    // Handle image upload if provided
    if (imageUrl) {
      try {
        const course = await this.prisma.course.create({ 
          data: { ...courseData, instructorId: instructorId || null } 
        });
        
        const uploadResult = await this.cloudinaryService.uploadCourseImage(imageUrl, course.id);
        
        // Update course with Cloudinary data
        return this.prisma.course.update({
          where: { id: course.id },
          data: {
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        // If image upload fails, create course without image
        console.error('Failed to upload course image:', error);
        return this.prisma.course.create({ 
          data: { ...courseData, instructorId: instructorId || null } 
        });
      }
    }
    
    return this.prisma.course.create({ 
      data: { ...courseData, instructorId: instructorId || null } 
    });
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

    const { imageUrl, ...updateData } = updateCourseDto;
    
    // Handle image update if provided
    if (imageUrl && imageUrl !== course.imageUrl) {
      try {
        // Delete old image if it exists
        if (course.imagePublicId) {
          await this.cloudinaryService.deleteFile(course.imagePublicId);
        }
        
        // Upload new image
        const uploadResult = await this.cloudinaryService.uploadCourseImage(imageUrl, id);
        
        return this.prisma.course.update({
          where: { id },
          data: {
            ...updateData,
            imageUrl: uploadResult.secure_url,
            imagePublicId: uploadResult.public_id,
          },
        });
      } catch (error) {
        console.error('Failed to update course image:', error);
        // Continue with update without image change
      }
    }
    
    return this.prisma.course.update({ where: { id }, data: updateData });
  }

  async remove(id: string, user: UserFromJwt) {
    const course = await this.prisma.course.findUnique({ where: { id } });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== Role.ADMIN && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete your own courses');
    }

    // Delete course image from Cloudinary if it exists
    if (course.imagePublicId) {
      try {
        await this.cloudinaryService.deleteFile(course.imagePublicId);
      } catch (error) {
        console.error('Failed to delete course image from Cloudinary:', error);
        // Continue with course deletion even if image deletion fails
      }
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
