/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto, CreateAttemptDto } from './dtos/quizzes.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { UserFromJwt } from '../auth/interfaces/auth.interface';

@ApiTags('Quizzes')
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('quizzes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // Quizzes
  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get quizzes for a course' })
  @ApiResponse({ status: 200, description: 'Quizzes retrieved successfully' })
  getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(courseId);
  }

  @Post()
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new quiz (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Quiz created successfully' })
  createQuiz(@Body() data: CreateQuizDto, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.createQuiz(data, user);
  }

  @Put(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update a quiz (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Quiz updated successfully' })
  updateQuiz(@Param('id') id: string, @Body() data: UpdateQuizDto, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.updateQuiz(id, data, user);
  }

  @Delete(':id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a quiz (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Quiz deleted successfully' })
  deleteQuiz(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.deleteQuiz(id, user);
  }

  // Questions
  @Get(':quizId/questions')
  @ApiOperation({ summary: 'Get questions for a quiz' })
  @ApiResponse({ status: 200, description: 'Questions retrieved successfully' })
  getQuestionsByQuiz(@Param('quizId') quizId: string) {
    return this.quizzesService.getQuestionsByQuiz(quizId);
  }

  @Post('questions')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a new question (Instructor/Admin only)' })
  @ApiResponse({ status: 201, description: 'Question created successfully' })
  createQuestion(@Body() data: CreateQuestionDto, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.createQuestion(data, user);
  }

  @Put('questions/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Update a question (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  updateQuestion(@Param('id') id: string, @Body() data: UpdateQuestionDto, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.updateQuestion(id, data, user);
  }

  @Delete('questions/:id')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Delete a question (Instructor/Admin only)' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  deleteQuestion(@Param('id') id: string, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.deleteQuestion(id, user);
  }

  // Attempts
  @Get('attempts/user/:userId')
  @ApiOperation({ summary: 'Get quiz attempts by user (Student can see own attempts, Instructor/Admin can see any attempts)' })
  @ApiResponse({ status: 200, description: 'Quiz attempts retrieved successfully' })
  getAttemptsByUser(@Param('userId') userId: string, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.getAttemptsByUser(userId, user);
  }

  @Post('attempts')
  @Roles(Role.STUDENT, Role.INSTRUCTOR, Role.ADMIN)
  @ApiOperation({ summary: 'Create a quiz attempt (Student can attempt quizzes they are enrolled in, Instructor/Admin can attempt any quiz)' })
  @ApiResponse({ status: 201, description: 'Quiz attempt created successfully' })
  createAttempt(@Body() data: CreateAttemptDto, @CurrentUser() user: UserFromJwt) {
    return this.quizzesService.createAttempt(data, user);
  }
}
