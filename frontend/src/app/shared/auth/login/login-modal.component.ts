import { Component } from '@angular/core';
import { ModalService } from '../../modal/modal.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login-modal',
  imports: [CommonModule],
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  constructor(public modalService: ModalService) {}
}
