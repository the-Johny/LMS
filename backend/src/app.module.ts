import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressService } from './progress/progress.service';
import { ProgressController } from './progress/progress.controller';
import { ProgressModule } from './progress/progress.module';
import { ConfigModule } from '@nestjs/config';
import { AppMailerModule } from './mailer/mailer.module';
import { AnalyticsController } from './analytics/analytics.controller';
import { AnalyticsService } from './analytics/analytics.service';
import { AnalyticsModule } from './analytics/analytics.module';

@Module({
  imports: [
    PrismaModule,
    ProgressModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AppMailerModule,
    AnalyticsModule,
  ],
  controllers: [AppController, ProgressController, AnalyticsController],
  providers: [AppService, PrismaService, ProgressService, AnalyticsService],
})
export class AppModule {}
