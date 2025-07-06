import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../Services/auth.service';

@Component({
  standalone: true,
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class RegisterModalComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    public modalService: ModalService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['STUDENT', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  close() {
    this.modalService.closeModals();
  }

  toggleToLogin() {
    this.modalService.openLogin();
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const { confirmPassword, ...registerData } = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.isLoading = false;
          this.close();
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        }
      });
    }
  }
}
