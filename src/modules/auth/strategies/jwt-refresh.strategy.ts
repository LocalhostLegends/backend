import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';

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
    const user = await this._usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}