import { Component, inject } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-register-modal',
  templateUrl: './register-modal.component.html',
  imports: [CommonModule],
})
export class RegisterModalComponent {
  modal = inject(ModalService);

  close() {
    this.modal.closeModals();
  }

  toggleToLogin() {
    this.modal.openLogin();
  }
}
