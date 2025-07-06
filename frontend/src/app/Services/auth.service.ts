import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:3000/auth';

  private isLoggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return new Observable((observer) => {
      this.http
        .post<AuthResponse>(`${this.baseUrl}/login`, { email, password })
        .subscribe({
          next: (res) => {
            localStorage.setItem('token', res.access_token);
            localStorage.setItem('user', JSON.stringify(res.user));
            this.isLoggedInSubject.next(true);
            observer.next(res);
            observer.complete();
          },
          error: (err) => observer.error(err),
        });
    });
  }

  register(
    name: string,
    email: string,
    password: string
  ): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, {
      name,
      email,
      password,
    });
  }

  updateProfile(update: { name?: string; email?: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/profile`, update);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): {
    id: string;
    email: string;
    name: string;
    role: string;
  } | null {
    try {
      return JSON.parse(localStorage.getItem('user') || '');
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  refreshLoginStatus(): void {
    this.isLoggedInSubject.next(this.hasToken());
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'ADMIN';
  }

  isInstructor(): boolean {
    return this.getCurrentUser()?.role === 'INSTRUCTOR';
  }

  isStudent(): boolean {
    return this.getCurrentUser()?.role === 'STUDENT';
  }

  hasRole(role: string): boolean {
    return this.getCurrentUser()?.role === role;
  }
  isAuthenticated(): boolean {
    return this.hasToken();
  }
}
