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

    const isAdmin = user.roles.some((role) =>
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
    );
    const isHR = user.roles.includes(UserRole.HR);
    const isManager = user.roles.includes(UserRole.MANAGER);

    if (isAdmin) return { effect: 'SKIP' };

    const wrappedRes = resource as WrappedResource | undefined;
    const currentRoles = wrappedRes?.old?.roles || wrappedRes?.roles || [];
    const newRoles = wrappedRes?.new?.['roles'] as UserRole[] | undefined;

    const targetHasAdmin = currentRoles.some((role) =>
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
    );
    const targetHasHR = currentRoles.includes(UserRole.HR);
    const targetHasManager = currentRoles.includes(UserRole.MANAGER);

    if (currentRoles.length > 0) {
      if (isHR) {
        if (targetHasAdmin) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: ['Admin editing permissions', false],
            },
          };
        }
        // HR can edit others (HR, Manager, Employee)
      } else if (isManager) {
        if (targetHasAdmin || targetHasHR) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: ['Admin/HR editing permissions', false],
            },
          };
        }

        if (targetHasManager) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: ['permissions to modify other Managers', false],
            },
          };
        }
      }
    }

    if (newRoles) {
      const givingAdmin = newRoles.some((role) =>
        [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
      );
      const givingHR = newRoles.includes(UserRole.HR);
      const givingManager = newRoles.includes(UserRole.MANAGER);

      if (isHR) {
        if (givingAdmin) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: [`permissions to promote users to Admin`, false],
            },
          };
        }
      } else if (isManager) {
        if (givingAdmin || givingHR || givingManager) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: [`promoting users to higher roles`, false],
            },
          };
        }
      }
    }

    return { effect: 'SKIP' };
  }
}
