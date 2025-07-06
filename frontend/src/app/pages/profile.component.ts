import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../Services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  name = '';
  email = '';
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser();
    if (this.user) {
      this.name = this.user.name;
      this.email = this.user.email;
    }
  }

  updateProfile() {
    this.loading = true;
    this.successMessage = '';
    this.errorMessage = '';
    this.authService.updateProfile({ name: this.name, email: this.email }).subscribe({
      next: (user) => {
        this.user = user;
        this.successMessage = 'Profile updated successfully!';
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Failed to update profile.';
        this.loading = false;
      }
    });
  }
} 