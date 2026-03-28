import { UserRole } from '@/database/entities/user.entity.enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface JwtRefreshPayload {
  sub: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  role: UserRole;
}
