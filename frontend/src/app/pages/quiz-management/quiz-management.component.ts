import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { InstructorService } from '../../Services/instructor.service';

@Component({
  selector: 'app-quiz-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './quiz-management.component.html',
  styleUrls: ['./quiz-management.component.css']
})
export class QuizManagementComponent implements OnInit {
  quizzes: any[] = [];
  courses: any[] = [];
  selectedCourse: any = null;
  isCreatingQuiz = false;
  isEditingQuiz = false;
  isCreatingQuestion = false;
  selectedQuiz: any = null;
  selectedQuestion: any = null;
  isLoading = true;
  quizForm: FormGroup;
  questionForm: FormGroup;

  questionTypes = ['MCQ', 'TRUE_FALSE', 'SHORT_ANSWER'];

  constructor(
    private instructorService: InstructorService,
    private fb: FormBuilder
  ) {
    this.quizForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      courseId: ['', Validators.required],
      timeLimit: [30, [Validators.required, Validators.min(1)]]
    });

    this.questionForm = this.fb.group({
      question: ['', [Validators.required, Validators.minLength(10)]],
      type: ['MCQ', Validators.required],
      quizId: ['', Validators.required],
      options: this.fb.array([]),
      answer: ['', Validators.required]
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
          this.loadQuizzes(courses[0].id);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.isLoading = false;
      }
    });
  }

  loadQuizzes(courseId: string) {
    if (!courseId) return;
    
    this.instructorService.getCourseQuizzes(courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
      }
    });
  }

  onCourseChange(event: any) {
    const courseId = event.target.value;
    this.selectedCourse = this.courses.find(c => c.id === courseId);
    if (this.selectedCourse) {
      this.loadQuizzes(courseId);
    }
  }

  openCreateQuiz() {
    this.isCreatingQuiz = true;
    this.isEditingQuiz = false;
    this.selectedQuiz = null;
    this.quizForm.reset({
      timeLimit: 30,
      courseId: this.selectedCourse?.id || ''
    });
  }

  openEditQuiz(quiz: any) {
    this.isEditingQuiz = true;
    this.isCreatingQuiz = false;
    this.selectedQuiz = quiz;
    
    this.quizForm.patchValue({
      title: quiz.title,
      courseId: quiz.courseId,
      timeLimit: quiz.timeLimit
    });
  }

  openCreateQuestion(quiz: any) {
    this.isCreatingQuestion = true;
    this.selectedQuiz = quiz;
    this.selectedQuestion = null;
    this.questionForm.reset({
      type: 'MCQ',
      quizId: quiz.id
    });
    this.setupOptionsForType('MCQ');
  }

  closeQuizForm() {
    this.isCreatingQuiz = false;
    this.isEditingQuiz = false;
    this.selectedQuiz = null;
    this.quizForm.reset();
  }

  closeQuestionForm() {
    this.isCreatingQuestion = false;
    this.selectedQuestion = null;
    this.questionForm.reset();
  }

  onSubmitQuiz() {
    if (this.quizForm.valid) {
      const quizData = this.quizForm.value;

      if (this.isCreatingQuiz) {
        this.instructorService.createQuiz(quizData).subscribe({
          next: (response) => {
            console.log('Quiz created successfully:', response);
            this.loadQuizzes(this.selectedCourse.id);
            this.closeQuizForm();
          },
          error: (error) => {
            console.error('Error creating quiz:', error);
          }
        });
      } else if (this.isEditingQuiz && this.selectedQuiz) {
        this.instructorService.updateQuiz(this.selectedQuiz.id, quizData).subscribe({
          next: (response) => {
            console.log('Quiz updated successfully:', response);
            this.loadQuizzes(this.selectedCourse.id);
            this.closeQuizForm();
          },
          error: (error) => {
            console.error('Error updating quiz:', error);
          }
        });
      }
    }
  }

  onSubmitQuestion() {
    if (this.questionForm.valid) {
      const questionData = this.questionForm.value;
      
      // Format options for MCQ and TRUE_FALSE types
      if (questionData.type === 'MCQ' || questionData.type === 'TRUE_FALSE') {
        questionData.options = questionData.options.map((option: any) => ({
          value: option.value,
          isCorrect: option.isCorrect || false
        }));
      } else if (questionData.type === 'SHORT_ANSWER') {
        // For SHORT_ANSWER, we don't need options
        questionData.options = [];
      }

      this.instructorService.createQuestion(questionData).subscribe({
        next: (response) => {
          console.log('Question created successfully:', response);
          this.closeQuestionForm();
          // Refresh the quizzes to show the new question
          this.loadQuizzes(this.selectedCourse.id);
        },
        error: (error) => {
          console.error('Error creating question:', error);
        }
      });
    }
  }

  deleteQuiz(quizId: string) {
    if (confirm('Are you sure you want to delete this quiz? This action cannot be undone.')) {
      this.instructorService.deleteQuiz(quizId).subscribe({
        next: () => {
          console.log('Quiz deleted successfully');
          this.loadQuizzes(this.selectedCourse.id);
        },
        error: (error) => {
          console.error('Error deleting quiz:', error);
        }
      });
    }
  }

  deleteQuestion(questionId: string) {
    if (confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      this.instructorService.deleteQuestion(questionId).subscribe({
        next: () => {
          console.log('Question deleted successfully');
          // Refresh quiz data
          this.loadQuizzes(this.selectedCourse.id);
        },
        error: (error) => {
          console.error('Error deleting question:', error);
        }
      });
    }
  }

  onQuestionTypeChange(event: any) {
    const type = event.target.value;
    this.setupOptionsForType(type);
  }

  setupOptionsForType(type: string) {
    const optionsArray = this.questionForm.get('options') as FormArray;
    optionsArray.clear();

    if (type === 'MCQ') {
      for (let i = 0; i < 4; i++) {
        optionsArray.push(this.fb.group({
          value: [''],
          isCorrect: [i === 0] // First option is correct by default
        }));
      }
    } else if (type === 'TRUE_FALSE') {
      optionsArray.push(this.fb.group({
        value: ['True'],
        isCorrect: [true]
      }));
      optionsArray.push(this.fb.group({
        value: ['False'],
        isCorrect: [false]
      }));
    } else if (type === 'SHORT_ANSWER') {
      // For text-based questions, we don't need options
      optionsArray.clear();
    }
  }

  get optionsArray() {
    return this.questionForm.get('options') as FormArray;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
} 