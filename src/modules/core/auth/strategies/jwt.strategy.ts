import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '@config/app.config';
import { AuthorizedUser } from '@common/types/authorized-user.type';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { UserStatus } from '@database/enums/user-status.enum';

import { UsersService } from '../../users/users.service';

export interface JwtPayloadWithCompany {
  sub: string;
  email: string;
  role: string;
  companyId: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly _usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayloadWithCompany): Promise<AuthorizedUser> {
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
  }
}
