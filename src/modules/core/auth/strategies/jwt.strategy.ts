import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '@config/app.config';
import { AuthorizedUser } from '@/modules/core/users/users.types';
import { UserStatus } from '@common/enums/user-status.enum';
import { UsersService } from '@modules/core/users/users.service';
import { UsersErrors } from '@modules/core/users/users.errors';

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
      departmentId: user.department?.id || null,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
