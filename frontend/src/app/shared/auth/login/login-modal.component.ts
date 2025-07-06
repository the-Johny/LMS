import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  modalService = inject(ModalService);
  auth = inject(AuthService);
  fb = inject(FormBuilder);

  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;
  loginForm: FormGroup;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  close() {
    this.modalService.closeModals();
  }

  toggleToRegister() {
    this.modalService.openRegister();
  }

  login() {
    if (this.loginForm.invalid) return;
    this.isLoading = true;
    const { email, password } = this.loginForm.value;
    this.auth.login(email, password).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.email = '';
        this.password = '';
        this.errorMessage = '';
        this.close();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Invalid credentials';
      },
    });
  }
}
