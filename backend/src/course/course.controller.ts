/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Controller,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Get,
  Query,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CourseQueryDto } from './dtos/course-query.dto';
import { CreateCourseDto } from './dtos/create-course.dto';
import { UpdateCourseDto } from './dtos/update-course.dto';
import { PaginationResponse } from './entities/entity';

@ApiTags('courses')
@Controller('courses')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCourse(
    @Body() createCourseDto: CreateCourseDto,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const course = await this.courseService.createCourse(createCourseDto);

      return {
        success: true,
        data: course,
        message: 'Course created successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to create course',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses with pagination and filtering' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  @ApiQuery({
    name: 'level',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'instructorId', required: false, type: String })
  @ApiQuery({ name: 'isPublished', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Courses retrieved successfully' })
  async getAllCourses(
    @Query() queryDto: CourseQueryDto,
  ): Promise<PaginationResponse<any>> {
    try {
      const result = await this.courseService.findAllCourses(queryDto);

      return {
        success: true,
        data: result.courses,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch courses',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Course retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const course = await this.courseService.findCourseById(id);

      if (!course) {
        throw new HttpException(
          {
            success: false,
            message: 'Course not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: course,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch course',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update course by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateCourseDto })
  @ApiResponse({ status: 200, description: 'Course updated successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async updateCourse(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<{ success: boolean; data?: any; message?: string }> {
    try {
      const course = await this.courseService.updateCourse(id, updateCourseDto);

      if (!course) {
        throw new HttpException(
          {
            success: false,
            message: 'Course not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: course,
        message: 'Course updated successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Failed to update course',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete course by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async deleteCourse(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.courseService.deleteCourse(id);

      if (!success) {
        throw new HttpException(
          {
            success: false,
            message: 'Course not found',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        message: 'Course deleted successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          message: 'Failed to delete course',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('instructor/:instructorId')
  @ApiOperation({ summary: 'Get courses by instructor ID' })
  @ApiParam({ name: 'instructorId', type: String })
  @ApiResponse({
    status: 200,
    description: 'Instructor courses retrieved successfully',
  })
  async getCoursesByInstructor(
    @Param('instructorId') instructorId: string,
  ): Promise<{ success: boolean; data?: any[] }> {
    try {
      const courses =
        await this.courseService.getCoursesByInstructor(instructorId);

      return {
        success: true,
        data: courses,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to fetch instructor courses',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
