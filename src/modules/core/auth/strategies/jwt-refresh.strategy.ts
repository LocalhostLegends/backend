import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

import config from '@config/app.config';
import { UserStatus } from '@database/enums/user-status.enum';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { AuthorizedUser } from '@common/types/authorized-user.type';

import { JwtRefreshPayload } from '../auth.types';
import { UsersService } from '../../users/users.service';

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
        throw new UnauthorizedException(ErrorMessages.USER_WITH_ID_NOT_FOUND(payload.sub));
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException(ErrorMessages.USER_NOT_ACTIVE);
      }

      if (user.deletedAt) {
        throw new UnauthorizedException(ErrorMessages.USER_DELETED);
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
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
  }
}
