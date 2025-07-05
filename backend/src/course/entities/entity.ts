import {
  Announcement,
  Category,
  Certificate,
  DiscussionPost,
  Enrollment,
  LessonCompletion,
  LessonType,
  Level,
  Progress,
  Quiz,
  Review,
  Role,
} from '@prisma/client';

export class User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  isEmailVerified: boolean;
  resetToken?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Course {
  id: string;
  title: string;
  description: string;
  objectives: string[];
  prerequisites: string[];
  level: Level;
  category: Category;
  isPublished: boolean;
  instructorId: string;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  instructor?: User;
  modules?: Module[];
  enrollments?: Enrollment[];
  reviews?: Review[];
  announcements?: Announcement[];
  quizzes?: Quiz[];
  discussions?: DiscussionPost[];
  certificates?: Certificate[];
}

export class Module {
  id: string;
  title: string;
  courseId: string;

  // Relations
  course?: Course;
  lessons?: Lesson[];
}

export class Lesson {
  id: string;
  title: string;
  contentUrl: string;
  type: LessonType;
  isVisible: boolean;
  order: number;
  moduleId: string;

  // Relations
  module?: Module;
  progress?: Progress[];
  completions?: LessonCompletion[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
