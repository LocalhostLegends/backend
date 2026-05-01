import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import type { Request } from 'express';

import config from '@config/app.config';
import { UserStatus } from '@common/enums/user-status.enum';
import { AuthorizedUser } from '@/modules/core/users/users.types';
import { UsersService } from '@modules/core/users/users.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { JwtRefreshPayload } from '../auth.types';

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
        throw ExceptionFactory.userWithIdNotFound(payload.sub);
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw ExceptionFactory.userNotActive();
      }

      if (user.deletedAt) {
        throw ExceptionFactory.userDeleted();
      }

      const permissions = await this._usersService.getUserPermissions(user.id);

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        companyId: payload.companyId,
        departmentId: user.department?.id || null,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions,
        permissionsVersion: user.permissionsVersion,
      };
    } catch {
      throw ExceptionFactory.unauthorized();
    }
  }
}
