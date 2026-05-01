import { Injectable } from '@nestjs/common';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { ResourceHelper } from '../utils/resource-helper.service';

@Injectable()
export class CompanyBoundaryRule implements PolicyRule {
  priority = 0;

  private readonly actionErrorMap: Partial<Record<PermissionAction, ExceptionCode>> = {
    [PermissionAction.DEPARTMENT_READ]: ExceptionCode.DEPARTMENT_NOT_IN_COMPANY,
    [PermissionAction.DEPARTMENT_UPDATE]: ExceptionCode.DEPARTMENT_NOT_IN_COMPANY,
    [PermissionAction.DEPARTMENT_DELETE]: ExceptionCode.DEPARTMENT_NOT_IN_COMPANY,
    [PermissionAction.DEPARTMENT_CREATE]: ExceptionCode.DEPARTMENT_NOT_IN_COMPANY,

    [PermissionAction.POSITION_READ]: ExceptionCode.POSITION_NOT_IN_COMPANY,
    [PermissionAction.POSITION_UPDATE]: ExceptionCode.POSITION_NOT_IN_COMPANY,
    [PermissionAction.POSITION_DELETE]: ExceptionCode.POSITION_NOT_IN_COMPANY,
    [PermissionAction.POSITION_CREATE]: ExceptionCode.POSITION_NOT_IN_COMPANY,

    [PermissionAction.INVITE_READ]: ExceptionCode.INVITE_NOT_IN_COMPANY,
    [PermissionAction.INVITE_CANCEL]: ExceptionCode.INVITE_NOT_IN_COMPANY,
    [PermissionAction.INVITE_RESEND]: ExceptionCode.INVITE_NOT_IN_COMPANY,
    [PermissionAction.INVITE_CREATE]: ExceptionCode.INVITE_NOT_IN_COMPANY,

    [PermissionAction.USER_CREATE]: ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP,
  };

  constructor(private readonly resourceHelper: ResourceHelper) {}

  supports(): boolean {
    return true;
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    if (!resource) return { effect: 'SKIP' };

    const resourceCompanyId = this.resourceHelper.getResourceCompanyId(resource);

    if (resourceCompanyId && resourceCompanyId !== user.companyId) {
      const code =
        this.actionErrorMap[action as PermissionAction] ||
        ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP;

      return {
        effect: 'DENY',
        reason: { code, params: [resource.id || 'new', user.companyId] },
      };
    }

    return { effect: 'SKIP' };
  }
}
