import { Role } from '@prisma/client';

export class UserProfileDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Additional profile stats
  totalCoursesCreated?: number;
  totalEnrollments?: number;
  totalCertificates?: number;
  totalReviews?: number;
}