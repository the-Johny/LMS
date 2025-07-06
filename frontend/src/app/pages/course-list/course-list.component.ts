import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CourseService, Course } from '../../Services/course.service';

@Component({
  standalone: true,
  selector: 'app-course-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  loading = true;
  searchQuery = '';
  errorMessage = '';

  constructor(private courseService: CourseService) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.filteredCourses = [...data];
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = 'Failed to load courses';
        console.error('Error loading courses:', err);
      },
    });
  }

  searchCourses(): void {
    this.filteredCourses = this.courses.filter((course) =>
      course.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  getPlaceholderImage(title: string): string {
    return `https://via.placeholder.com/400x300?text=${encodeURIComponent(title)}`;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://via.placeholder.com/400x300?text=No+Image';
  }
}
