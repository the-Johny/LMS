/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
  Put,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseResponseDto,
} from './dto/course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard, RolesGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new course (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Course created successfully' })
  create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all courses' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: [CourseResponseDto],
  })
  findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  @ApiResponse({
    status: 200,
    description: 'Course retrieved successfully',
    type: CourseResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Update course by ID (Admin/Instructor only)' })
  @ApiResponse({
    status: 200,
    description: 'Course updated successfully',
    type: CourseResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @ApiOperation({ summary: 'Delete course by ID (Admin/Instructor only)' })
  @ApiResponse({ status: 200, description: 'Course deleted successfully' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.remove(id, user);
  }

  @Put(':id/assign-instructor')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign an instructor to a course (Admin only)' })
  @ApiResponse({ status: 200, description: 'Instructor assigned successfully' })
  async assignInstructor(
    @Param('id') courseId: string,
    @Body('instructorId') instructorId: string,
  ) {
    return this.coursesService.assignInstructor(courseId, instructorId);
  }
}
