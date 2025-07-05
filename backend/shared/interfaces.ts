/* eslint-disable prettier/prettier */
import { LessonType } from '@prisma/client';

export interface Module {
  id: string;
  title: string;
  courseId: string;
}

export interface Lesson {
  id: string;
  title: string;
  contentUrl: string;
  type: LessonType;
  isVisible: boolean;
  order: number;
  moduleId: string;
}
