import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalService } from '../../../shared/modal/modal.service';

@Component({
  imports: [CommonModule],
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  constructor(public modalService: ModalService) {}

  openLogin() {
    this.modalService.openLogin();
  }
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
  openRegister() {
    this.modalService.openRegister();
  }
}
