import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRole } from '../enums/user-role.enum';
import { RequestWithUser } from '../types/request-with-user.type';
import { ErrorMessages } from '../exceptions/error-messages';
import { ROLES_KEY } from '../decorators/require-role.decorator';

@Injectable()
export class UserRolesGuard implements CanActivate {
  private readonly logger = new Logger(UserRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRolesStr = requiredRoles?.length ? requiredRoles.join(', ') : 'none';
    this.logger.debug(`Required roles: ${requiredRolesStr}`);

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    if (!user) {
      this.logger.warn('Access denied: No user in request');
      throw new ForbiddenException(ErrorMessages.USER_NOT_FOUND);
    }

    this.logger.debug(`User: ${user.email || user.id}, Role: ${user.role}`);

    const hasRequiredRole = requiredRoles.includes(user.role);

    if (!hasRequiredRole) {
      this.logger.warn(
        `Access denied for user ${user.email || user.id}. Required: ${requiredRolesStr}, Got: ${user.role}`,
      );
      throw new ForbiddenException(
        ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(requiredRolesStr, false),
      );
    }

    this.logger.debug(`Access granted for user ${user.email || user.id}`);
    return true;
  }
}
