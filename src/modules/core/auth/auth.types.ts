import { UserRole } from '@common/enums/user-role.enum';

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
