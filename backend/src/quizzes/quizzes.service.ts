/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  // Quizzes
  async getQuizzesByCourse(courseId: string) {
    console.log('QuizzesService.getQuizzesByCourse', { courseId });
    return this.prisma.quiz.findMany({ where: { courseId } });
  }
  async createQuiz(data: any, user: any) {
    console.log('QuizzesService.createQuiz', { data });
    
    // Check if user is instructor of the course or admin
    const course = await this.prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    if (user.role !== 'ADMIN' && course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create quizzes for your own courses');
    }

    return this.prisma.quiz.create({ data });
  }
  async updateQuiz(id: string, data: any, user: any) {
    console.log('QuizzesService.updateQuiz', { id, data });
    
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (user.role !== 'ADMIN' && quiz.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update quizzes for your own courses');
    }

    return this.prisma.quiz.update({ where: { id }, data });
  }
  async deleteQuiz(id: string, user: any) {
    console.log('QuizzesService.deleteQuiz', { id });
    
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (user.role !== 'ADMIN' && quiz.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete quizzes for your own courses');
    }

    return this.prisma.quiz.delete({ where: { id } });
  }

  // Questions
  async getQuestionsByQuiz(quizId: string) {
    console.log('QuizzesService.getQuestionsByQuiz', { quizId });
    return this.prisma.question.findMany({ where: { quizId } });
  }
  async createQuestion(data: any, user: any) {
    console.log('QuizzesService.createQuestion', { data });
    
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: data.quizId },
      include: { course: true },
    });

    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    if (user.role !== 'ADMIN' && quiz.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only create questions for your own courses');
    }

    return this.prisma.question.create({
      data: {
        ...data,
        options: { create: data.options },
      },
    });
  }
  async updateQuestion(id: string, data: any, user: any) {
    console.log('QuizzesService.updateQuestion', { id, data });
    
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (user.role !== 'ADMIN' && question.quiz.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only update questions for your own courses');
    }

    return this.prisma.question.update({ where: { id }, data });
  }
  async deleteQuestion(id: string, user: any) {
    console.log('QuizzesService.deleteQuestion', { id });
    
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { quiz: { include: { course: true } } },
    });

    if (!question) {
      throw new NotFoundException('Question not found');
    }

    if (user.role !== 'ADMIN' && question.quiz.course.instructorId !== user.userId) {
      throw new ForbiddenException('You can only delete questions for your own courses');
    }

    return this.prisma.question.delete({ where: { id } });
  }

  // Attempts
  async getAttemptsByUser(userId: string) {
    console.log('QuizzesService.getAttemptsByUser', { userId });
    return this.prisma.quizAttempt.findMany({ where: { userId } });
  }
  async createAttempt(data: { quizId: string; userId: string; answers: { questionId: string; answer: string }[] }) {
    console.log('QuizzesService.createAttempt', { data });
    const { quizId, userId, answers } = data;
    // Fetch all questions for the quiz
    const questions = await this.prisma.question.findMany({ where: { quizId } });
    // Map answers for quick lookup
    const answerMap = new Map<string, string>();
    for (const ans of answers) {
      answerMap.set(ans.questionId, ans.answer);
    }
    let correct = 0;
    const feedback: any[] = [];
    for (const q of questions) {
      const userAnswer = answerMap.get(q.id);
      let isCorrect = false;
      let correctAnswer = q.answer;
      if (q.type === 'MCQ' || q.type === 'TRUE_FALSE') {
        isCorrect = userAnswer === q.answer;
        if (isCorrect) correct++;
      }
      feedback.push({
        questionId: q.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer,
        explanation: isCorrect ? 'Correct' : 'Incorrect',
      });
    }
    const total = questions.length;
    const percentage = (correct / total) * 100;
    let resultFeedback = '';
    if (percentage < 40) resultFeedback = 'fail';
    else if (percentage === 40) resultFeedback = 'pass';
    else if (percentage === 50) resultFeedback = 'need improvement';
    else if (percentage === 60) resultFeedback = 'satisfactory';
    else if (percentage > 70) resultFeedback = 'excellent';
    const passed = percentage >= 40;
    // Store attempt
    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId,
        answers,
        score: Math.round(percentage),
      },
    });
    // Update module and course progress
    await this.updateModuleProgress(userId, quizId);
    await this.updateCourseProgress(userId, quizId);
    return { attempt, percentage, feedback, passed, resultFeedback };
  }

  async updateModuleProgress(userId: string, quizId: string) {
    console.log('QuizzesService.updateModuleProgress', { userId, quizId });
    // Find the module for this quiz
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) return;
    // Find the module(s) that contain lessons with this quiz
    const modules = await this.prisma.module.findMany({ where: { courseId: quiz.courseId } });
    for (const module of modules) {
      // Get all quizzes in the module (by lessons in the module)
      const lessons = await this.prisma.lesson.findMany({ where: { moduleId: module.id } });
      const quizzesInModule = await this.prisma.quiz.findMany({ where: { courseId: quiz.courseId } });
      // Check if user passed all quizzes in the module
      const passedAll = await Promise.all(
        quizzesInModule.map(async (q) => {
          const attempt = await this.prisma.quizAttempt.findFirst({
            where: { userId, quizId: q.id, score: { gte: 40 } },
          });
          return !!attempt;
        })
      );
      const complete = passedAll.every(Boolean);
      await this.prisma.userModuleProgress.upsert({
        where: { userId_moduleId: { userId, moduleId: module.id } },
        update: { complete },
        create: { userId, moduleId: module.id, complete },
      });
    }
  }

  async updateCourseProgress(userId: string, quizId: string) {
    console.log('QuizzesService.updateCourseProgress', { userId, quizId });
    // Find the quiz and its course
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) return;
    const courseId = quiz.courseId;
    // Get all modules in the course
    const modules = await this.prisma.module.findMany({ where: { courseId } });
    // Check if user completed all modules
    const completedAll = await Promise.all(
      modules.map(async (module) => {
        const progress = await this.prisma.userModuleProgress.findUnique({
          where: { userId_moduleId: { userId, moduleId: module.id } },
        });
        return progress?.complete;
      })
    );
    const complete = completedAll.every(Boolean);
    await this.prisma.userCourseProgress.upsert({
      where: { userId_courseId: { userId, courseId } },
      update: { complete },
      create: { userId, courseId, complete },
    });
  }
}
