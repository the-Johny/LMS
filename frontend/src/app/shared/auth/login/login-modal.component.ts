import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { AuthService } from '../../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  modalService = inject(ModalService);
  auth = inject(AuthService);

  email = '';
  password = '';
  errorMessage = '';

  close() {
    this.modalService.closeModals();
  }

  toggleToRegister() {
    this.modalService.openRegister();
  }

login() {
  this.auth.login(this.email, this.password).subscribe({
    next: (res) => {
      console.log('Login successful:', res);

      // Optionally display a welcome message here
      // e.g., with a ToastService or Angular Material Snackbar

      // Reset fields and close modal
      this.email = '';
      this.password = '';
      this.errorMessage = '';
      this.close();
    },
    error: (err) => {
      console.error('Login failed:', err);
      this.errorMessage = 'Invalid credentials';
    },
  });
}
}
