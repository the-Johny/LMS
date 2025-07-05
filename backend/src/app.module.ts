import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
<<<<<<< HEAD
import { ContentModule } from './content/content.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { ProgressModule } from './progress/progress.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ModulesModule } from './modules/modules.module';
import { LessonsModule } from './lessons/lessons.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PrismaModule,
    ContentModule,
    EnrollmentsModule,
    QuizzesModule,
    AnalyticsModule,
    ProgressModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    ReviewsModule,
    ModulesModule,
    LessonsModule
=======
import { AnalyticsModule } from './analytics/analytics.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ContentModule } from './content/content.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ProgressModule } from './progress/progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AnalyticsModule,
    QuizzesModule,
    MailerModule,
    ContentModule,
    EnrollmentsModule,
    ProgressModule,
>>>>>>> 42a7c2172a98b0d572c66f21caa4b29afaf55885
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
