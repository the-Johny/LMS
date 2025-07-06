import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ModalService } from '../../../shared/modal/modal.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  menuOpen = false;

  constructor(
    public modalService: ModalService,
    public authService: AuthService
  ) {}

  openLogin() {
    this.modalService.openLogin();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openRegister() {
    this.modalService.openRegister();
  }

  logout() {
    this.authService.logout();
  }
}
