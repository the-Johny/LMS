import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InstructorService } from '../../Services/instructor.service';

@Component({
  selector: 'app-module-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './module-management.component.html',
  styleUrls: ['./module-management.component.css']
})
export class ModuleManagementComponent implements OnInit {
  modules: any[] = [];
  courses: any[] = [];
  selectedCourse: any = null;
  isCreatingModule = false;
  isEditingModule = false;
  selectedModule: any = null;
  isLoading = true;
  moduleForm: FormGroup;

  constructor(
    private instructorService: InstructorService,
    private fb: FormBuilder
  ) {
    this.moduleForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      courseId: ['', Validators.required]
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
      },
      error: (error) => {
        console.error('Error loading modules:', error);
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

  openCreateModule() {
    this.isCreatingModule = true;
    this.isEditingModule = false;
    this.selectedModule = null;
    this.moduleForm.reset();
    this.moduleForm.patchValue({
      courseId: this.selectedCourse?.id || ''
    });
  }

  openEditModule(module: any) {
    this.isEditingModule = true;
    this.isCreatingModule = false;
    this.selectedModule = module;
    
    this.moduleForm.patchValue({
      title: module.title,
      courseId: module.courseId
    });
  }

  closeForm() {
    this.isCreatingModule = false;
    this.isEditingModule = false;
    this.selectedModule = null;
    this.moduleForm.reset();
  }

  onSubmit() {
    if (this.moduleForm.valid) {
      const moduleData = this.moduleForm.value;

      if (this.isCreatingModule) {
        this.instructorService.createModule(moduleData).subscribe({
          next: (response) => {
            console.log('Module created successfully:', response);
            this.loadModules(this.selectedCourse.id);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error creating module:', error);
          }
        });
      } else if (this.isEditingModule && this.selectedModule) {
        this.instructorService.updateModule(this.selectedModule.id, { title: moduleData.title }).subscribe({
          next: (response) => {
            console.log('Module updated successfully:', response);
            this.loadModules(this.selectedCourse.id);
            this.closeForm();
          },
          error: (error) => {
            console.error('Error updating module:', error);
          }
        });
      }
    }
  }

  deleteModule(moduleId: string) {
    if (confirm('Are you sure you want to delete this module? This action cannot be undone.')) {
      this.instructorService.deleteModule(moduleId).subscribe({
        next: () => {
          console.log('Module deleted successfully');
          this.loadModules(this.selectedCourse.id);
        },
        error: (error) => {
          console.error('Error deleting module:', error);
        }
      });
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 