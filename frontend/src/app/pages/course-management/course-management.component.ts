import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../../Services/instructor.service';

@Component({
  selector: 'app-course-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './course-management.component.html',
  styleUrls: ['./course-management.component.css']
})
export class CourseManagementComponent implements OnInit {
  courses: any[] = [];
  isCreatingCourse = false;
  isEditingCourse = false;
  selectedCourse: any = null;
  isLoading = true;
  courseForm: FormGroup;

  courseLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
  courseCategories = ['PROGRAMMING', 'DESIGN', 'BUSINESS', 'MARKETING', 'LIFESTYLE', 'OTHER'];

  constructor(
    private instructorService: InstructorService,
    private fb: FormBuilder
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      objectives: ['', [Validators.required]],
      prerequisites: [''],
      level: ['BEGINNER', Validators.required],
      category: ['PROGRAMMING', Validators.required],
      isPublished: [false],
      imageUrl: ['']
    });
  }

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.isLoading = true;
    this.instructorService.getInstructorCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  openCreateCourse() {
    this.isCreatingCourse = true;
    this.isEditingCourse = false;
    this.selectedCourse = null;
    this.courseForm.reset({
      level: 'BEGINNER',
      category: 'PROGRAMMING',
      isPublished: false
    });
  }

  openEditCourse(course: any) {
    this.isEditingCourse = true;
    this.isCreatingCourse = false;
    this.selectedCourse = course;
    
    this.courseForm.patchValue({
      title: course.title,
      description: course.description,
      objectives: course.objectives.join('\n'),
      prerequisites: course.prerequisites.join('\n'),
      level: course.level,
      category: course.category,
      isPublished: course.isPublished,
      imageUrl: course.imageUrl || ''
    });
  }

  closeForm() {
    this.isCreatingCourse = false;
    this.isEditingCourse = false;
    this.selectedCourse = null;
    this.courseForm.reset();
  }

  onSubmit() {
    if (this.courseForm.valid) {
      const formData = this.courseForm.value;
      const courseData = {
        ...formData,
        objectives: formData.objectives.split('\n').filter((obj: string) => obj.trim()),
        prerequisites: formData.prerequisites.split('\n').filter((pre: string) => pre.trim())
      };

      if (this.isCreatingCourse) {
        this.instructorService.createCourse(courseData).subscribe({
          next: (response) => {
            console.log('Course created successfully:', response);
            this.loadCourses();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating course:', error);
          }
        });
      } else if (this.isEditingCourse && this.selectedCourse) {
        this.instructorService.updateCourse(this.selectedCourse.id, courseData).subscribe({
          next: (response) => {
            console.log('Course updated successfully:', response);
            this.loadCourses();
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating course:', error);
          }
        });
      }
    }
  }

  deleteCourse(courseId: string) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      this.instructorService.deleteCourse(courseId).subscribe({
        next: () => {
          console.log('Course deleted successfully');
          this.loadCourses();
        },
        error: (error) => {
          console.error('Error deleting course:', error);
        }
      });
    }
  }

  toggleCourseStatus(course: any) {
    const updatedData = { ...course, isPublished: !course.isPublished };
    this.instructorService.updateCourse(course.id, updatedData).subscribe({
      next: (response) => {
        console.log('Course status updated:', response);
        this.loadCourses();
      },
      error: (error) => {
        console.error('Error updating course status:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getStatusBadgeClass(isPublished: boolean): string {
    return isPublished 
      ? 'bg-green-100 text-green-800 border-green-200' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  getLevelBadgeClass(level: string): string {
    switch (level) {
      case 'BEGINNER': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ADVANCED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
} 