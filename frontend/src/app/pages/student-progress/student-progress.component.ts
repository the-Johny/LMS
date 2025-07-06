import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InstructorService } from '../../Services/instructor.service';

@Component({
  selector: 'app-student-progress',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student-progress.component.html',
  styleUrls: ['./student-progress.component.css']
})
export class StudentProgressComponent implements OnInit {
  courses: any[] = [];
  selectedCourse: any = null;
  enrollments: any[] = [];
  selectedStudent: any = null;
  studentProgress: any[] = [];
  moduleProgress: any[] = [];
  lessonStats: any[] = [];
  timeSpent: any = null;
  quizAttempts: any[] = [];
  certificates: any[] = [];
  dashboardStats: any = null;
  learningPathData: any[] = [];
  isLoading = true;
  activeTab = 'overview';

  constructor(private instructorService: InstructorService) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading = true;
    this.instructorService.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (courses.length > 0) {
          this.selectedCourse = courses[0];
          this.loadEnrollments(courses[0].id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  loadEnrollments(courseId: string) {
    if (!courseId) return;
    
    this.instructorService.getCourseEnrollments(courseId).subscribe({
      next: (enrollments) => {
        this.enrollments = enrollments;
        if (enrollments.length > 0) {
          this.selectedStudent = enrollments[0];
          // Check if user object exists before accessing its properties
          if (enrollments[0].user?.id) {
            this.loadStudentData(enrollments[0].user.id);
          } else if (enrollments[0].userId) {
            // Fallback to userId if user object is not available
            this.loadStudentData(enrollments[0].userId);
          }
        }
        // Load dashboard stats and learning path data
        this.loadDashboardStats();
        this.loadLearningPathData();
      },
      error: (error) => {
        console.error('Error loading enrollments:', error);
      }
    });
  }

  loadStudentData(userId: string) {
    if (!userId) return;

    // Load comprehensive student data
    this.loadUserCourseProgress(userId);
    this.loadStudentProgressAnalytics(userId);
    this.loadTimeSpentAnalytics(userId);
    this.loadQuizAttempts(userId);
    this.loadStudentCertificates(userId);
  }

  loadUserCourseProgress(userId: string) {
    this.instructorService.getUserCourseProgress(userId).subscribe({
      next: (progress) => {
        this.studentProgress = progress;
      },
      error: (error) => {
        console.error('Error loading user course progress:', error);
      }
    });
  }

  loadStudentProgressAnalytics(userId: string) {
    this.instructorService.getStudentProgressAnalytics(userId).subscribe({
      next: (analytics) => {
        // Handle analytics data
        console.log('Student progress analytics:', analytics);
      },
      error: (error) => {
        console.error('Error loading student progress analytics:', error);
      }
    });
  }

  loadTimeSpentAnalytics(userId: string) {
    const courseId = this.selectedCourse?.id;
    this.instructorService.getTimeSpentAnalytics(userId, courseId).subscribe({
      next: (timeData) => {
        this.timeSpent = timeData;
      },
      error: (error) => {
        console.error('Error loading time spent analytics:', error);
      }
    });
  }

  loadQuizAttempts(userId: string) {
    this.instructorService.getQuizAttempts(userId).subscribe({
      next: (attempts) => {
        this.quizAttempts = attempts;
      },
      error: (error) => {
        console.error('Error loading quiz attempts:', error);
      }
    });
  }

  loadStudentCertificates(userId: string) {
    this.instructorService.getStudentCertificates(userId).subscribe({
      next: (certificates) => {
        this.certificates = certificates;
      },
      error: (error) => {
        console.error('Error loading student certificates:', error);
      }
    });
  }

  loadModuleProgressDetails(moduleId: string, enrollmentId: string) {
    this.instructorService.getModuleProgressDetails(moduleId, enrollmentId).subscribe({
      next: (progress) => {
        this.moduleProgress = [progress];
      },
      error: (error) => {
        console.error('Error loading module progress details:', error);
      }
    });
  }

  loadLessonCompletionStats(lessonId: string) {
    const courseId = this.selectedCourse?.id;
    this.instructorService.getLessonCompletionStats(lessonId, courseId).subscribe({
      next: (stats) => {
        this.lessonStats = [stats];
      },
      error: (error) => {
        console.error('Error loading lesson completion stats:', error);
      }
    });
  }

  onCourseChange(event: any) {
    const courseId = event.target.value;
    this.selectedCourse = this.courses.find(c => c.id === courseId);
    if (this.selectedCourse) {
      this.loadEnrollments(courseId);
    }
  }

  onStudentChange(event: any) {
    const userId = event.target.value;
    this.selectedStudent = this.enrollments.find(e => e.user?.id === userId || e.userId === userId);
    if (this.selectedStudent) {
      this.loadStudentData(userId);
    }
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  issueCertificate() {
    if (!this.selectedStudent || !this.selectedCourse) return;

    const userId = this.selectedStudent.user?.id || this.selectedStudent.userId;
    if (!userId) return;

    const certificateData = {
      userId: userId,
      courseId: this.selectedCourse.id,
      certificateUrl: `https://example.com/certificates/${userId}_${this.selectedCourse.id}.pdf`
    };

    this.instructorService.issueCertificate(certificateData).subscribe({
      next: (response) => {
        console.log('Certificate issued successfully:', response);
        this.loadStudentCertificates(userId);
      },
      error: (error) => {
        console.error('Error issuing certificate:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'text-green-600';
    if (progress >= 60) return 'text-yellow-600';
    if (progress >= 40) return 'text-orange-600';
    return 'text-red-600';
  }

  getProgressBarColor(progress: number): string {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    if (progress >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  }

  refreshData() {
    if (this.selectedCourse) {
      this.loadEnrollments(this.selectedCourse.id);
      this.loadDashboardStats();
      this.loadLearningPathData();
    }
  }

  getAverageQuizScore(quizScores: any[]): number {
    if (!quizScores || quizScores.length === 0) return 0;
    const total = quizScores.reduce((sum, score) => sum + (score.score || 0), 0);
    return Math.round(total / quizScores.length);
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'not started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  loadDashboardStats() {
    if (!this.selectedCourse) return;
    
    this.instructorService.getDashboardStats().subscribe({
      next: (stats) => {
        this.dashboardStats = stats;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
      }
    });
  }

  loadLearningPathData() {
    if (!this.selectedCourse) return;
    
    this.instructorService.getLearningPathData(this.selectedCourse.id).subscribe({
      next: (data) => {
        this.learningPathData = data;
      },
      error: (error) => {
        console.error('Error loading learning path data:', error);
      }
    });
  }
} 