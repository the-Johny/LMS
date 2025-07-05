/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentsController } from './enrollments.controller';

@Module({
  providers: [EnrollmentsService],
  controllers: [EnrollmentsController]
})
export class EnrollmentsModule {}
