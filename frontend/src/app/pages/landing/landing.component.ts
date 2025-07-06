import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService, Course } from '../../Services/course.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.component.html',
})
export class LandingComponent implements OnInit {
  topCourses: Course[] = [];

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.courseService.getAllCourses().subscribe({
      next: (courses: Course[]) => {
        this.topCourses = courses.slice(0, 4); 
      },
      error: (err: unknown) => {
        console.error('Error loading courses', err);
      },
    });
  }
}
