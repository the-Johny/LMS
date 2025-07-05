/* eslint-disable prettier/prettier */
import { Category, Level } from '@prisma/client';

export interface Content {
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
}
