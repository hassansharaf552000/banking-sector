export interface User {
  id?: string;
  email: string;
  name?: string;
  role?: string;
  token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number; 
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenPayload {
  sub: string;
  email: string;
  role?: string;
  iat: number;
  exp: number;
}
