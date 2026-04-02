import { UserRole } from '@database/entities/user.entity.enums';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  companyId: string;
}

export interface JwtRefreshPayload {
  sub: string;
  companyId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface AuthorizedUser {
  id: string;
  email: string;
  role: UserRole;
  companyId: string;
}