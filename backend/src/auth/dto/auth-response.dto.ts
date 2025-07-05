import { Role } from '@prisma/client';

export class AuthResponseDto {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
  accessToken: string;
  refreshToken?: string;
}
