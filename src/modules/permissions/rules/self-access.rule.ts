import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import {
  PolicyResult,
  PermissionResource,
  isWrappedResource,
  getSafeProperty,
} from '../types/permissions.types';

@Injectable()
export class SelfAccessRule implements PolicyRule {
  priority = 10;

  private readonly ALLOWED_SELF_UPDATE_FIELDS = [
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'customFields',
  ];

  supports(action: string): boolean {
    return [
      PermissionAction.USER_READ,
      PermissionAction.USER_UPDATE,
      PermissionAction.USER_UPDATE_SELF,
    ].includes(action as PermissionAction);
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    if (!resource) return { effect: 'SKIP' };

    const resourceId = getSafeProperty<string | number>(resource, 'id');
    if (!resourceId || resourceId !== user.id) return { effect: 'SKIP' };

    const actionEnum = action as PermissionAction;

    if (
      (actionEnum === PermissionAction.USER_UPDATE ||
        actionEnum === PermissionAction.USER_UPDATE_SELF) &&
      user.roles.some((role) =>
        [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MANAGER].includes(role),
      )
    ) {
      return { effect: 'SKIP' };
    }

    if (actionEnum === PermissionAction.USER_READ) {
      return { effect: 'ALLOW' };
    }

    if (
      actionEnum === PermissionAction.USER_UPDATE ||
      actionEnum === PermissionAction.USER_UPDATE_SELF
    ) {
      const wrappedRes = isWrappedResource(resource) ? resource : undefined;
      const updateData = (wrappedRes?.new || resource) as Record<string, unknown>;

      const updateKeys = Object.keys(updateData).filter(
        (key) => key !== 'id' && updateData[key] !== undefined,
      );

      const hasRestrictedFields = updateKeys.some(
        (key) => !this.ALLOWED_SELF_UPDATE_FIELDS.includes(key),
      );

      if (hasRestrictedFields) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['Only basic profile fields can be updated by yourself'],
          },
        };
      }

      return { effect: 'ALLOW' };
    }

    return { effect: 'SKIP' };
  }
}
