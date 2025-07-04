/* eslint-disable prettier/prettier */
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  certificateId?: string;
}
