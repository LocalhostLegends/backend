import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { Department } from '@database/entities/department.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { ResourceHelper } from '../utils/resource-helper.service';

@Injectable()
export class DepartmentScopeRule implements PolicyRule {
  priority = 60;

  constructor(private readonly resourceHelper: ResourceHelper) {}

  supports(action: string): boolean {
    return [
      PermissionAction.USER_READ,
      PermissionAction.USER_UPDATE,
      PermissionAction.USER_CREATE,
      PermissionAction.DEPARTMENT_UPDATE,
      PermissionAction.DEPARTMENT_READ,
    ].includes(action as PermissionAction);
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    if (user.role !== UserRole.MANAGER || !user.departmentId) return { effect: 'SKIP' };
    if (!resource) return { effect: 'SKIP' };

    const resourceId = resource instanceof Department ? resource.id : resource.id;
    const actionEnum = action as PermissionAction;

    if (
      (actionEnum === PermissionAction.DEPARTMENT_UPDATE ||
        actionEnum === PermissionAction.DEPARTMENT_READ) &&
      resourceId &&
      resourceId !== user.departmentId
    ) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: ['your own department'],
        },
      };
    }

    const resourceDeptId = this.resourceHelper.getResourceDepartmentId(resource);

    if (actionEnum === PermissionAction.USER_CREATE && !resourceDeptId) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: ['department is required for creation'],
        },
      };
    }

    if (
      (actionEnum === PermissionAction.USER_READ ||
        actionEnum === PermissionAction.USER_UPDATE ||
        actionEnum === PermissionAction.USER_CREATE) &&
      resourceDeptId &&
      resourceDeptId !== user.departmentId
    ) {
      return {
        effect: 'DENY',
        reason: {
          code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
          params: ['your department scope'],
        },
      };
    }

    return { effect: 'SKIP' };
  }
}
