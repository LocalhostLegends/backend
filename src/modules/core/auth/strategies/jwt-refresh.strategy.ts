import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { UsersService } from '@/modules/core/users/users.service';
import { UserStatus } from '@/database/enums';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { AuthorizedUser } from '../auth.types';
import { JwtRefreshPayload } from '../auth.types';

type RequestWithRefreshCookie = Request & {
  cookies: {
    refresh_token?: string;
  };
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly _usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_REFRESH_SECRET');

    if (!secret) {
      throw new Error('JWT_REFRESH_SECRET is not defined');
    }

    super({
      jwtFromRequest: (req: RequestWithRefreshCookie): string | null =>
        req.cookies?.refresh_token ?? null,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<AuthorizedUser> {
    try {
      const user = await this._usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.status !== UserStatus.ACTIVE) {
        throw new UnauthorizedException('User account is not active');
      }

      if (user.deletedAt) {
        throw new UnauthorizedException('User account has been deleted');
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