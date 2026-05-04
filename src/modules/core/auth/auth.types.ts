import { UserRole } from '@common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  companyId: string;
  permissions: string[];
  pv: number; // permission version
}

export interface JwtRefreshPayload {
  sub: string;
  companyId: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}
