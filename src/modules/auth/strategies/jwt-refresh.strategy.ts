import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';

import { JwtRefreshPayload } from '../auth.types';

type RequestWithRefreshCookie = Request & {
  cookies: {
    refreshToken?: string;
  };
};

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly _usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.refreshSecret');

    if (!secret) {
      throw new Error('Jwt refresh secret is not defined');
    }

    super({
      jwtFromRequest: (req: RequestWithRefreshCookie): string | null =>
        req.cookies.refreshToken ?? null,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<User> {
    try {
      const user: User = await this._usersService.findById(payload.sub);
      return user;
    } catch {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
  }
}
