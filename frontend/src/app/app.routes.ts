import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { CourseListComponent } from './pages/course-list/course-list.component';
import { InstructorDashboardComponent } from './pages/instructor-dashboard/instructor-dashboard.component';
import { CourseManagementComponent } from './pages/course-management/course-management.component';
import { ModuleManagementComponent } from './pages/module-management/module-management.component';
import { LessonManagementComponent } from './pages/lesson-management/lesson-management.component';
import { QuizManagementComponent } from './pages/quiz-management/quiz-management.component';
import { AuthGuard } from './guards/auth.guard';
import { InstructorLayoutComponent } from './pages/instructor-layout.component';
import { CourseDetailsComponent } from './pages/course-details.component';
import { ProfileComponent } from './pages/profile.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'courses', component: CourseListComponent },
  { path: 'courses/:id', component: CourseDetailsComponent },
  { path: 'profile', component: ProfileComponent },
  {
    path: 'instructor',
    component: InstructorLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'INSTRUCTOR' },
    children: [
      { path: 'dashboard', component: InstructorDashboardComponent },
      { path: 'courses', component: CourseManagementComponent },
      { path: 'modules', component: ModuleManagementComponent },
      { path: 'lessons', component: LessonManagementComponent },
      { path: 'quizzes', component: QuizManagementComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  // {
  //   path: 'courses/:id',
  //   component: CourseDetailsComponent,
  // },
];
