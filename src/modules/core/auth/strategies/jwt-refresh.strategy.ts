import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

import config from '@config/app.config';
import { UserStatus } from '@common/enums/user-status.enum';
import { AuthorizedUser } from '@/modules/core/users/users.types';
import { UsersService } from '@modules/core/users/users.service';
import { UsersErrors } from '@modules/core/users/users.errors';

import { JwtRefreshPayload } from '../auth.types';
import { AuthErrors } from '../auth.errors';

type RequestWithRefreshCookie = Request & {
  cookies: {
    refresh_token?: string;
  };
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly _usersService: UsersService) {
    super({
      jwtFromRequest: (req: RequestWithRefreshCookie): string | null =>
        req.cookies?.refresh_token ?? null,
      secretOrKey: config.jwt.refreshSecret,
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<AuthorizedUser> {
    try {
      const user = await this._usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException(UsersErrors.userWithIdNotFound(payload.sub));
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException(UsersErrors.userNotActive);
      }

      if (user.deletedAt) {
        throw new UnauthorizedException(UsersErrors.userDeleted);
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: payload.companyId,
        firstName: user.firstName,
        lastName: user.lastName,
      };
    } catch {
      throw new UnauthorizedException(AuthErrors.unauthorized);
    }
  }
}
