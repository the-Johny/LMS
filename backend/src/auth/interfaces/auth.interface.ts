import { Role } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

export interface UserFromJwt {
  userId: string;
  email: string;
  role: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
} 