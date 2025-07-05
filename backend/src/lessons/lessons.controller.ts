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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import {
  CreateLessonDto,
  UpdateLessonDto,
  LessonResponseDto,
} from './dto/lesson.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new lesson (Instructor/Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Lesson created successfully',
    type: LessonResponseDto,
  })
  create(@Body() createLessonDto: CreateLessonDto, @CurrentUser() user: any) {
    return this.lessonsService.create(createLessonDto, user);
  }

  @Get('module/:moduleId')
  @ApiOperation({ summary: 'Get all lessons for a module' })
  @ApiResponse({
    status: 200,
    description: 'Lessons retrieved successfully',
    type: [LessonResponseDto],
  })
  findByModule(@Param('moduleId') moduleId: string) {
    return this.lessonsService.findByModule(moduleId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson by ID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson retrieved successfully',
    type: LessonResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update lesson by ID (Instructor/Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Lesson updated successfully',
    type: LessonResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.update(id, updateLessonDto, user);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete lesson by ID (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Lesson deleted successfully' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.lessonsService.remove(id, user);
  }
}
