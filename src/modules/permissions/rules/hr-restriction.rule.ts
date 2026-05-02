import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { ResourceHelper } from '../utils/resource-helper.service';

@Injectable()
export class HrRestrictionRule implements PolicyRule {
  priority = 50;

  constructor(private readonly resourceHelper: ResourceHelper) {}

  supports(action: string): boolean {
    return [
      PermissionAction.USER_UPDATE,
      PermissionAction.USER_DELETE,
      PermissionAction.USER_READ,
    ].includes(action as PermissionAction);
  }

  check(user: AuthorizedUser, _action: string, resource?: PermissionResource | null): PolicyResult {
    const targetRole = this.resourceHelper.getResourceRole(resource);
    if (!targetRole) return { effect: 'SKIP' };

    if (user.role === UserRole.HR && targetRole === UserRole.ADMIN) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: [UserRole.ADMIN, false],
        },
      };
    }

    if (
      user.role === UserRole.HR &&
      targetRole === UserRole.HR &&
      resource &&
      user.id !== resource.id
    ) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: [UserRole.HR, false],
        },
      };
    }

    if (
      user.role === UserRole.MANAGER &&
      (targetRole === UserRole.ADMIN || targetRole === UserRole.HR)
    ) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: ['HR or ADMIN', false],
        },
      };
    }

    if (
      user.role === UserRole.MANAGER &&
      targetRole === UserRole.MANAGER &&
      resource &&
      user.id !== resource.id
    ) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: [UserRole.MANAGER, false],
        },
      };
    }

    return { effect: 'SKIP' };
  }
}
