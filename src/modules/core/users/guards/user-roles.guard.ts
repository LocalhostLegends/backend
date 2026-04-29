import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '@common/enums/user-role.enum';
import { getAppRequestUser } from '@/common/utils/http.utils';

import { USER_ROLES_KEY } from '../decorators/require-user-roles.decorator';

@Injectable()
export class UserRolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(USER_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles.length > 0) {
      const user = getAppRequestUser(context);
      const hasRole = requiredRoles.includes(user.role);

      if (!hasRole) {
        throw new ForbiddenException(
          `User does not have any of the required roles: ${requiredRoles.join(', ')}`,
        );
      }
    }

    return true;
  }
}
