import { Injectable } from '@nestjs/common';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { SalaryRevisionStatus } from '@common/enums/salary-revision-status.enum';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import {
  PolicyResult,
  PermissionResource,
  isWrappedResource,
  getSafeProperty,
} from '../types/permissions.types';

@Injectable()
export class PayrollRule implements PolicyRule {
  priority = 10;

  supports(action: string): boolean {
    return [
      PermissionAction.PAYROLL_READ_SELF,
      PermissionAction.SALARY_REVISION_READ_SELF,
      PermissionAction.SALARY_REVISION_CREATE,
      PermissionAction.SALARY_REVISION_MANAGE,
      PermissionAction.PAYROLL_MANAGE,
    ].includes(action as PermissionAction);
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    const actionEnum = action as PermissionAction;

    if (
      actionEnum === PermissionAction.PAYROLL_MANAGE ||
      actionEnum === PermissionAction.SALARY_REVISION_MANAGE
    ) {
      const isHR = user.roles.some((role) =>
        ['admin', 'super_admin', 'hr'].includes(role.toLowerCase()),
      );

      if (!resource) return isHR ? { effect: 'ALLOW' } : { effect: 'SKIP' };

      const wrappedRes = isWrappedResource(resource) ? resource : undefined;
      const resourceCompanyId =
        wrappedRes?.companyId ||
        getSafeProperty<string>(resource, 'companyId') ||
        getSafeProperty<{ id: string }>(resource, 'company')?.id;

      if (isHR && resourceCompanyId === user.companyId) return { effect: 'ALLOW' };

      const isManager = user.roles.some((role) => role.toLowerCase() === 'manager');
      if (isManager && resource) {
        const employee =
          getSafeProperty<Record<string, unknown>>(resource, 'user') ||
          (resource as Record<string, unknown>);
        const managerId = employee['managerId'];

        if (typeof managerId === 'string' && managerId === user.id) {
          if (actionEnum === PermissionAction.SALARY_REVISION_MANAGE) {
            const status = getSafeProperty<SalaryRevisionStatus>(resource, 'status');
            if (status && (status as string) !== (SalaryRevisionStatus.PENDING as string)) {
              return { effect: 'DENY', reason: { code: ExceptionCode.AUTH_FORBIDDEN } };
            }
          }
          return { effect: 'ALLOW' };
        }
      }
    }

    if (actionEnum === PermissionAction.SALARY_REVISION_CREATE) return { effect: 'ALLOW' };

    if (
      actionEnum === PermissionAction.PAYROLL_READ_SELF ||
      actionEnum === PermissionAction.SALARY_REVISION_READ_SELF
    ) {
      if (!resource) return { effect: 'ALLOW' };

      const resourceId =
        getSafeProperty<string>(resource, 'id') ||
        getSafeProperty<{ id: string }>(resource, 'user')?.id;

      if (resourceId === user.id) return { effect: 'ALLOW' };
    }

    return { effect: 'SKIP' };
  }
}
