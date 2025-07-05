/* eslint-disable prettier/prettier */
export interface Quiz {
  id: string;
  title: string;
  courseId: string;
  timeLimit?: number;
  createdAt: Date;
}