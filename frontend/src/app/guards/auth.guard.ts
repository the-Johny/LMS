import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../Services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if user is authenticated
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/'], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check if route requires specific role
    const requiredRole = route.data['role'];
    if (requiredRole) {
      if (!this.authService.hasRole(requiredRole)) {
        // Redirect to appropriate dashboard based on user role
        if (this.authService.isInstructor() || this.authService.isAdmin()) {
          this.router.navigate(['/instructor/dashboard']);
        } else if (this.authService.isStudent()) {
          this.router.navigate(['/courses']);
        } else {
          this.router.navigate(['/']);
        }
        return false;
      }
    }

    return true;
  }
} 