export class UserStatsDto {
  totalUsers: number;
  totalAdmins: number;
  totalInstructors: number;
  totalStudents: number;
  verifiedUsers: number;
  unverifiedUsers: number;
  recentUsers: number; // users created in last 30 days
}
