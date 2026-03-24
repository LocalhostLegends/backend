import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import {  Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';

import { JwtRefreshPayload } from '../auth.types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    configService: ConfigService,
    private readonly _usersService: UsersService,
  ) {
    const secret = configService.get<string>('jwt.refreshSecret');

    if (!secret) {
      throw new Error('Jwt refresh secret is not defined');
    }

    super({
      jwtFromRequest: (req: Request) => req.cookies?.refreshToken ?? null,
      secretOrKey: secret
    });
  }

  async validate(payload: JwtRefreshPayload): Promise<User> {
    try {
      return await this._usersService.findById(payload.sub);
    } catch {
      throw new UnauthorizedException(ErrorMessages.UNAUTHORIZED);
    }
  }
}