import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

@Component({
  standalone: true,
  selector: 'app-course-list',
  imports: [CommonModule, FormsModule, ],
  templateUrl: './course-list.component.html',
})
export class CourseListComponent implements OnInit {
  courses: Course[] = [];
  filteredCourses: Course[] = [];
  visibleCourses: Course[] = [];
  loading = true;
  searchQuery = '';
  itemsToShow = 8;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchCourses();
  }

  fetchCourses(): void {
    this.http.get<Course[]>('/api/courses').subscribe({
      next: (data) => {
        this.courses = data;
        this.filteredCourses = [...data];
        this.visibleCourses = this.filteredCourses.slice(0, this.itemsToShow);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  searchCourses(): void {
    this.filteredCourses = this.courses.filter((course) =>
      course.title.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
    this.visibleCourses = this.filteredCourses.slice(0, this.itemsToShow);
  }

  loadMoreCourses(): void {
    this.itemsToShow += 4;
    this.visibleCourses = this.filteredCourses.slice(0, this.itemsToShow);
  }
}
