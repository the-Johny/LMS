/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Put, Delete, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, UpdateQuizDto, CreateQuestionDto, UpdateQuestionDto, CreateAttemptDto } from './dtos/quizzes.dto';

@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  // Quizzes
  @Get('course/:courseId')
  getQuizzesByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.getQuizzesByCourse(courseId);
  }

  @Post()
  createQuiz(@Body() data: CreateQuizDto) {
    return this.quizzesService.createQuiz(data);
  }

  @Put(':id')
  updateQuiz(@Param('id') id: string, @Body() data: UpdateQuizDto) {
    return this.quizzesService.updateQuiz(id, data);
  }

  @Delete(':id')
  deleteQuiz(@Param('id') id: string) {
    return this.quizzesService.deleteQuiz(id);
  }

  // Questions
  @Get(':quizId/questions')
  getQuestionsByQuiz(@Param('quizId') quizId: string) {
    return this.quizzesService.getQuestionsByQuiz(quizId);
  }

  @Post('questions')
  createQuestion(@Body() data: CreateQuestionDto) {
    return this.quizzesService.createQuestion(data);
  }

  @Put('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() data: UpdateQuestionDto) {
    return this.quizzesService.updateQuestion(id, data);
  }

  @Delete('questions/:id')
  deleteQuestion(@Param('id') id: string) {
    return this.quizzesService.deleteQuestion(id);
  }

  // Attempts
  @Get('attempts/user/:userId')
  getAttemptsByUser(@Param('userId') userId: string) {
    return this.quizzesService.getAttemptsByUser(userId);
  }

  @Post('attempts')
  createAttempt(@Body() data: CreateAttemptDto) {
    return this.quizzesService.createAttempt(data);
  }
}
