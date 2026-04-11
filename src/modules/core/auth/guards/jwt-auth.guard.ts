import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { User } from '@database/entities/user.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): ReturnType<typeof AuthGuard.prototype.canActivate> {
    return super.canActivate(context);
  }

  handleRequest<UserType = User>(
    err: Error | null,
    user: UserType,
    _: Error | string | null, // info
  ): UserType {
    if (err || !user) {
      throw err || new UnauthorizedException(ErrorMessages.INVALID_TOKEN);
    }
    return user;
  }
}
