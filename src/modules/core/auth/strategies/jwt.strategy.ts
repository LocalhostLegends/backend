import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import config from '@config/app.config';
import { AuthorizedUser } from '@/modules/core/users/users.types';
import { UserStatus } from '@common/enums/user-status.enum';
import { UsersService } from '@modules/core/users/users.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { JwtPayload } from '../auth.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly _usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwt.secret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthorizedUser> {
    const currentVersion = await this._usersService.getPermissionsVersion(payload.sub);

    if (currentVersion !== payload.pv) {
      throw ExceptionFactory.unauthorized();
    }

    const user = await this._usersService.findById(payload.sub);

    if (!user || user.status !== UserStatus.ACTIVE || user.deletedAt) {
      throw ExceptionFactory.unauthorized();
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: payload.companyId,
      departmentId: user.department?.id || null,
      firstName: user.firstName,
      lastName: user.lastName,
      permissions: payload.permissions || [],
      permissionsVersion: user.permissionsVersion,
    };
  }
}
