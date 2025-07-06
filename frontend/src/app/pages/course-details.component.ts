import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CourseService, Course, Review } from '../Services/course.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-details.component.html',
})
export class CourseDetailsComponent implements OnInit {
  course: Course | null = null;
  reviews: Review[] = [];
  loading = true;
  reviewsLoading = true;
  errorMessage = '';
  reviewsError = '';

  constructor(private route: ActivatedRoute, private courseService: CourseService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseService.getCourseById(id).subscribe({
        next: (data: Course) => {
          this.course = data;
          this.loading = false;
          this.fetchReviews(id);
        },
        error: (err: any) => {
          this.errorMessage = 'Failed to load course details';
          this.loading = false;
        },
      });
    } else {
      this.errorMessage = 'Invalid course ID';
      this.loading = false;
    }
  }

  fetchReviews(courseId: string) {
    this.reviewsLoading = true;
    this.courseService.getCourseReviews(courseId).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        this.reviewsLoading = false;
      },
      error: (err: any) => {
        this.reviewsError = 'Failed to load reviews';
        this.reviewsLoading = false;
      }
    });
  }

  enroll() {
    // Enrollment logic goes here
    alert('Enrolled in course: ' + (this.course?.title || ''));
  }
} 