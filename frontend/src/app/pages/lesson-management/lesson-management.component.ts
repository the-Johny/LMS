import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../../Services/instructor.service';

@Component({
  selector: 'app-lesson-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './lesson-management.component.html',
  styleUrls: ['./lesson-management.component.css']
})
export class LessonManagementComponent implements OnInit {
  lessons: any[] = [];
  courses: any[] = [];
  modules: any[] = [];
  selectedCourse: any = null;
  selectedModule: any = null;
  isCreatingLesson = false;
  isEditingLesson = false;
  selectedLesson: any = null;
  isLoading = true;
  lessonForm: FormGroup;
  selectedFile: File | null = null;
  uploadInProgress = false;
  uploadError: string | null = null;

  lessonTypes = ['PDF', 'VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT'];

  constructor(
    private instructorService: InstructorService,
    private fb: FormBuilder
  ) {
    this.lessonForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      contentUrl: ['', [Validators.required]],
      type: ['PDF', Validators.required],
      order: [1, [Validators.required, Validators.min(1)]],
      moduleId: ['', Validators.required],
      isVisible: [true]
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
        if (courses.length > 0) {
          this.selectedCourse = courses[0];
          this.loadModules(courses[0].id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  loadModules(courseId: string) {
    if (!courseId) return;
    
    this.instructorService.getCourseModules(courseId).subscribe({
      next: (modules) => {
        this.modules = modules;
        if (modules.length > 0) {
          this.selectedModule = modules[0];
          this.loadLessons(modules[0].id);
        }
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadLessons(moduleId: string) {
    if (!moduleId) return;
    
    this.instructorService.getModuleLessons(moduleId).subscribe({
      next: (lessons) => {
        this.lessons = lessons;
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
      }
    });
  }

  onCourseChange(event: any) {
    const courseId = event.target.value;
    this.selectedCourse = this.courses.find(c => c.id === courseId);
    if (this.selectedCourse) {
      this.loadModules(courseId);
    }
  }

  onModuleChange(event: any) {
    const moduleId = event.target.value;
    this.selectedModule = this.modules.find(m => m.id === moduleId);
    if (this.selectedModule) {
      this.loadLessons(moduleId);
    }
  }

  openCreateLesson() {
    this.isCreatingLesson = true;
    this.isEditingLesson = false;
    this.selectedLesson = null;
    this.lessonForm.reset({
      type: 'PDF',
      order: 1,
      isVisible: true,
      moduleId: this.selectedModule?.id || ''
    });
  }

  openEditLesson(lesson: any) {
    this.isEditingLesson = true;
    this.isCreatingLesson = false;
    this.selectedLesson = lesson;
    
    this.lessonForm.patchValue({
      title: lesson.title,
      contentUrl: lesson.contentUrl,
      type: lesson.type,
      order: lesson.order,
      moduleId: lesson.moduleId,
      isVisible: lesson.isVisible
    });
  }

  closeForm() {
    this.isCreatingLesson = false;
    this.isEditingLesson = false;
    this.selectedLesson = null;
    this.lessonForm.reset();
  }

  onSubmit() {
    if (this.lessonForm.valid) {
      const lessonData = this.lessonForm.value;

      if (this.isCreatingLesson) {
        this.instructorService.createLesson(lessonData).subscribe({
          next: (response) => {
            console.log('Lesson created successfully:', response);
            this.loadLessons(this.selectedModule.id);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating lesson:', error);
          }
        });
      } else if (this.isEditingLesson && this.selectedLesson) {
        const updateData = {
          title: lessonData.title,
          contentUrl: lessonData.contentUrl,
          type: lessonData.type,
          order: lessonData.order,
          isVisible: lessonData.isVisible
        };
        this.instructorService.updateLesson(this.selectedLesson.id, updateData).subscribe({
          next: (response) => {
            console.log('Lesson updated successfully:', response);
            this.loadLessons(this.selectedModule.id);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating lesson:', error);
          }
        });
      }
    }
  }

  deleteLesson(lessonId: string) {
    if (confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) {
      this.instructorService.deleteLesson(lessonId).subscribe({
        next: () => {
          console.log('Lesson deleted successfully');
          this.loadLessons(this.selectedModule.id);
        },
        error: (error) => {
          console.error('Error deleting lesson:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  getLessonTypeIcon(type: string): string {
    switch (type) {
      case 'PDF': return '📄';
      case 'VIDEO': return '🎥';
      case 'TEXT': return '📝';
      case 'QUIZ': return '❓';
      case 'ASSIGNMENT': return '📋';
      default: return '📄';
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadError = null;
    }
  }

  uploadLessonContentFile() {
    if (!this.selectedFile) {
      this.uploadError = 'No file selected.';
      return;
    }
    const lessonId = this.selectedLesson?.id || 'temp'; // Use a temp value if creating
    this.uploadInProgress = true;
    this.uploadError = null;
    this.instructorService.uploadLessonFile(this.selectedFile, lessonId).subscribe({
      next: (res) => {
        this.lessonForm.patchValue({ contentUrl: res.url });
        this.uploadInProgress = false;
      },
      error: (err) => {
        this.uploadError = 'Upload failed.';
        this.uploadInProgress = false;
      }
    });
  }
} 