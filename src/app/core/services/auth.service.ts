import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginCredentials, User, AuthResponse, RefreshTokenRequest } from '../models';
import { SecureStorage } from '../utils/secure-storage.util';
import { environment } from '../../../environments/environment';

const AUTH_STORAGE_KEY = environment.tokenKey;
const REFRESH_STORAGE_KEY = environment.refreshTokenKey;
const USER_STORAGE_KEY = 'auth_user';

const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@bank.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin',
  },
  {
    id: '2',
    email: 'user@bank.com',
    password: 'user123',
    name: 'Regular User',
    role: 'user',
  },
  {
    id: '3',
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
    role: 'user',
  },
];

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSignal = signal<User | null>(null);
  readonly currentUser = this.currentUserSignal.asReadonly();

  private isAuthenticatedSignal = signal<boolean>(false);
  readonly isAuthenticated = this.isAuthenticatedSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }


  private loadUserFromStorage(): void {
    const token = SecureStorage.getItem<string>(AUTH_STORAGE_KEY);
    const user = SecureStorage.getItem<User>(USER_STORAGE_KEY);

    if (token && user && !this.isTokenExpired(token)) {
      this.currentUserSignal.set(user);
      this.isAuthenticatedSignal.set(true);
    } else {
      this.clearStorage();
      this.currentUserSignal.set(null);
      this.isAuthenticatedSignal.set(false);
    }
  }

 
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    
    return this.mockLogin(credentials).pipe(
      tap((response) => {
        this.handleAuthResponse(response);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        throw error;
      })
    );
  }

 
  private mockLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    return new Observable<AuthResponse>((observer) => {
      setTimeout(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (!emailRegex.test(credentials.email)) {
          observer.error(new Error('Invalid email format'));
          return;
        }

        // Find user in mock database
        const user = MOCK_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (!user) {
          observer.error(new Error('Invalid email or password'));
          return;
        }

        const response: AuthResponse = {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          accessToken: this.generateMockToken(user.email),
          refreshToken: this.generateMockToken(user.email, true),
          expiresIn: 3600, 
        };

        observer.next(response);
        observer.complete();
      }, 500);
    });
  }

 
  private handleAuthResponse(response: AuthResponse): void {
    SecureStorage.setItem(AUTH_STORAGE_KEY, response.accessToken);
    if (response.refreshToken) {
      SecureStorage.setItem(REFRESH_STORAGE_KEY, response.refreshToken);
    }

    SecureStorage.setItem(USER_STORAGE_KEY, response.user);

    this.currentUserSignal.set(response.user);
    this.isAuthenticatedSignal.set(true);
  }

  
  logout(): void {
 
    this.clearStorage();
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }


  refreshToken(): Observable<AuthResponse | null> {
    const refreshToken = SecureStorage.getItem<string>(REFRESH_STORAGE_KEY);

    if (!refreshToken) {
      return of(null);
    }


    return of(null);
  }


  getToken(): string | null {
    return SecureStorage.getItem<string>(AUTH_STORAGE_KEY);
  }

  
  isTokenExpired(token?: string): boolean {
    const tokenToCheck = token || this.getToken();
    
    if (!tokenToCheck) {
      return true;
    }

    try {
      if (tokenToCheck.startsWith('mock_token_')) {
        return false;
      }

      const payload = this.decodeToken(tokenToCheck);
      if (!payload || !payload.exp) {
        return true;
      }

      const expirationTime = payload.exp * 1000; 
      return Date.now() >= expirationTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  
  private generateMockToken(email: string, isRefresh = false): string {
    const type = isRefresh ? 'refresh' : 'access';
    return `mock_token_${type}_${btoa(email)}_${Date.now()}`;
  }


  private clearStorage(): void {
    SecureStorage.removeItem(AUTH_STORAGE_KEY);
    SecureStorage.removeItem(REFRESH_STORAGE_KEY);
    SecureStorage.removeItem(USER_STORAGE_KEY);
  }
}
