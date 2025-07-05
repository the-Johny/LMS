/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';


@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  // Quizzes
  async getQuizzesByCourse(courseId: string) {
    return this.prisma.quiz.findMany({ where: { courseId } });
  }
  async createQuiz(data: any) {
    return this.prisma.quiz.create({ data });
  }
  async updateQuiz(id: string, data: any) {
    return this.prisma.quiz.update({ where: { id }, data });
  }
  async deleteQuiz(id: string) {
    return this.prisma.quiz.delete({ where: { id } });
  }

  // Questions
  async getQuestionsByQuiz(quizId: string) {
    return this.prisma.question.findMany({ where: { quizId } });
  }
  async createQuestion(data: any) {
    return this.prisma.question.create({
      data: {
        ...data,
        options: { create: data.options },
      },
    });
  }
  async updateQuestion(id: string, data: any) {
    return this.prisma.question.update({ where: { id }, data });
  }
  async deleteQuestion(id: string) {
    return this.prisma.question.delete({ where: { id } });
  }

  // Attempts
  async getAttemptsByUser(userId: string) {
    return this.prisma.quizAttempt.findMany({ where: { userId } });
  }
  async createAttempt(data: { quizId: string; userId: string; answers: { questionId: string; answer: string }[] }) {
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
