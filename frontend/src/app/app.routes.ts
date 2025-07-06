import { Routes } from '@angular/router';
import { LandingComponent } from './pages/landing/landing.component';
import { CourseListComponent } from './pages/course-list/course-list.component';

export const routes: Routes = [
  { path: '', component: LandingComponent },
  { path: 'courses', component: CourseListComponent },
  // {
  //   path: 'courses/:id',
  //   component: CourseDetailsComponent,
  // },
];
