import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { ModuleManagementComponent } from './pages/module-management/module-management.component';
import { LessonManagementComponent } from './pages/lesson-management/lesson-management.component';
import { QuizManagementComponent } from './pages/quiz-management/quiz-management.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'courses', component: CourseListComponent },
  { 
    path: 'instructor/dashboard', 
    component: InstructorDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' }
  },
  { 
    path: 'instructor/courses', 
    component: CourseManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' }
  },
  { 
    path: 'instructor/modules', 
    component: ModuleManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' }
  },
  { 
    path: 'instructor/lessons', 
    component: LessonManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' }
  },
  { 
    path: 'instructor/quizzes', 
    component: QuizManagementComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' }
  },
  // {
  //   path: 'courses/:id',
  //   component: CourseDetailsComponent,
  // },
];
