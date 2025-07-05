import { Role } from '@prisma/client';

export class UserWithRelationsDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Related data counts
  coursesCreated?: {
    count: number;
    published: number;
    unpublished: number;
  };
  
  enrollments?: {
    count: number;
    active: number;
    completed: number;
  };
  
  certificates?: {
    count: number;
    recent: any[];
  };
  
  reviews?: {
    count: number;
    averageRating: number;
  };
}