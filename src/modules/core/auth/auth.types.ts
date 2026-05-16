import { UserRole } from '@common/enums/user-role.enum';
import { UserResponseDto } from '@modules/core/users/dto/user-response.dto';

export interface JwtPayload {
  sub: string;
  roles: UserRole[];
  companyId: string;
  pv: number; // permission version
}

export interface JwtRefreshPayload {
  sub: string;
  companyId: string;
  rememberMe?: boolean;
  ip?: string;
  ua?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
  rememberMe?: boolean;
}
