import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource, WrappedResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';

@Injectable()
export class HrRestrictionRule implements PolicyRule {
  priority = 50;

  constructor() {}

  supports(action: string): boolean {
    return [
      PermissionAction.USER_UPDATE,
      PermissionAction.USER_DELETE,
      PermissionAction.USER_READ,
      PermissionAction.USER_MANAGE_ROLES,
    ].includes(action as PermissionAction);
  }

  check(user: AuthorizedUser, _action: string, resource?: PermissionResource | null): PolicyResult {
    if (resource && resource.id === user.id) return { effect: 'SKIP' };

    const wrappedRes = resource as WrappedResource | undefined;
    const currentRole = wrappedRes?.old?.role || wrappedRes?.role;
    const newRole = wrappedRes?.new?.['role'] as UserRole | undefined;

    if (currentRole) {
      if (user.role === UserRole.HR && currentRole === UserRole.ADMIN) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['Admin editing permissions', false],
          },
        };
      }

      if (
        user.role === UserRole.MANAGER &&
        (currentRole === UserRole.ADMIN || currentRole === UserRole.HR)
      ) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['Admin/HR editing permissions', false],
          },
        };
      }

      if (user.role === UserRole.MANAGER && currentRole === UserRole.MANAGER) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['permissions to modify other Managers', false],
          },
        };
      }
    }

    if (newRole) {
      if (user.role === UserRole.HR && newRole === UserRole.ADMIN) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: [`permissions to promote users to ${newRole}`, false],
          },
        };
      }

      if (
        user.role === UserRole.MANAGER &&
        (newRole === UserRole.ADMIN || newRole === UserRole.HR || newRole === UserRole.MANAGER)
      ) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: [`promoting users to ${newRole}`, false],
          },
        };
      }
    }

    return { effect: 'SKIP' };
  }
}
