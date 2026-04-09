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

@Injectable()
export class UserRolesGuard implements CanActivate {
  private readonly logger = new Logger(UserRolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    let requiredRole = this.reflector.get<UserRole>('role', context.getHandler());

    if (!requiredRole) {
      requiredRole = this.reflector.get<UserRole>('role', context.getClass());
    }

    this.logger.log(`Required role: ${requiredRole}`);

    if (!requiredRole) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const { user } = request;

    this.logger.log(`User from request: ${JSON.stringify(user)}`);

    if (!user) {
      throw new ForbiddenException(ErrorMessages.USER_NOT_FOUND);
    }

    this.logger.log(`User role: ${user.role}`);

    if (user.role !== requiredRole) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(requiredRole, false));
    }

    return true;
  }
}
