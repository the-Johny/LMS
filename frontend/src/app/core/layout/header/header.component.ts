import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalService } from '../../../shared/modal/modal.service';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../Services/auth.service';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
})

export class HeaderComponent implements OnInit {
  menuOpen = false;
  isLoggedIn = false;
  userName: string | null = null;


  constructor(
    public modalService: ModalService,
    public authService: AuthService
  ) {}

  ngOnInit() {
    this.authService.isLoggedIn$.subscribe((status: boolean) => {
      this.isLoggedIn = status;
      this.userName = status ? this.authService.getCurrentUser()?.name || null : null;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openLogin() {
    this.modalService.openLogin();
  }


  openRegister() {
    this.modalService.openRegister();
  }

  logout() {
    this.authService.logout();

    this.userName = null;

  }
}
