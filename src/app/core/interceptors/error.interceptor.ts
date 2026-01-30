import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An error occurred';

      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 401:
            console.warn('Unauthorized access - logging out');
            authService.logout();
            errorMessage = 'Your session has expired. Please login again.';
            break;

          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            router.navigate(['/dashboard']);
            break;

          case 404:
            errorMessage = 'The requested resource was not found.';
            break;

          case 500:
            errorMessage = 'A server error occurred. Please try again later.';
            break;

          case 0:
            errorMessage = 'Unable to connect to the server. Please check your internet connection.';
            break;

          default:
            errorMessage = error.error?.message || `Error: ${error.status} - ${error.statusText}`;
        }
      }

      console.error('HTTP Error:', errorMessage, error);
      return throwError(() => new Error(errorMessage));
    })
  );
};
