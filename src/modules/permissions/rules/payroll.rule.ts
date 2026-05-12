import { Injectable } from '@nestjs/common';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { SalaryRevisionStatus } from '@common/enums/salary-revision-status.enum';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource, WrappedResource } from '../permissions.service';

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

      const wrappedRes = resource as WrappedResource | undefined;
      const resourceCompanyId =
        wrappedRes?.companyId || (wrappedRes?.company as { id: string })?.id;

      if (isHR && resourceCompanyId === user.companyId) return { effect: 'ALLOW' };

      const isManager = user.roles.some((role) => role.toLowerCase() === 'manager');
      if (isManager && wrappedRes) {
        const employee = (wrappedRes.user || wrappedRes) as { managerId?: string };
        if (employee.managerId === user.id) {
          if (actionEnum === PermissionAction.SALARY_REVISION_MANAGE) {
            const status = wrappedRes.status as SalaryRevisionStatus | undefined;
            if (status && status !== SalaryRevisionStatus.PENDING) {
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

      const wrappedRes = resource as WrappedResource | undefined;
      const resourceId = wrappedRes?.id || (wrappedRes?.user as { id: string })?.id;
      if (resourceId === user.id) return { effect: 'ALLOW' };
    }

    return { effect: 'SKIP' };
  }
}
