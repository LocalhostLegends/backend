import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

import { User } from '@database/entities/user.entity';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { IS_PUBLIC_KEY } from '@common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext): ReturnType<typeof AuthGuard.prototype.canActivate> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest<UserType = User>(
    err: Error | null,
    user: UserType,
    _: Error | string | null, // info
  ): UserType {
    if (err || !user) {
      throw err || ExceptionFactory.invalidToken();
    }
    return user;
  }
}
