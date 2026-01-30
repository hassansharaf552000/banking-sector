import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';


export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  
  const isAuthEndpoint = 
    req.url.includes('/auth/login') || 
    req.url.includes('/auth/refresh') ||
    req.url.includes('/auth/register');

  if (isAuthEndpoint) {
    return next(req);
  }

  const token = authService.getToken();

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
