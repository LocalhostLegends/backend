import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

import { UsersService } from '@/modules/core/users/users.service';
import { User } from '@database/entities/user.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';

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
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<User> {
    try {
      const user = await this._usersService.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
  }
}