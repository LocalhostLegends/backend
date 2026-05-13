import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource, WrappedResource } from '../types/permissions.types';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { ResourceHelper } from '../utils/resource-helper.service';

@Injectable()
export class DepartmentScopeRule implements PolicyRule {
  priority = 60;

  private readonly ALLOWED_MANAGER_UPDATE_FIELDS = new Set<string>([
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'departmentId',
    'positionId',
    'status',
  ]);

  constructor(private readonly resourceHelper: ResourceHelper) {}

  supports(action: string): boolean {
    const allowedActions = new Set<PermissionAction>([
      PermissionAction.USER_READ,
      PermissionAction.USER_UPDATE,
      PermissionAction.USER_CREATE,
      PermissionAction.DEPARTMENT_UPDATE,
      PermissionAction.DEPARTMENT_READ,
    ]);
    return allowedActions.has(action as PermissionAction);
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    const isHigherRole = user.roles.some((role) =>
      [UserRole.HR, UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
    );

    if (isHigherRole || !user.roles.includes(UserRole.MANAGER) || !user.departmentId) {
      return { effect: 'SKIP' };
    }

    if (!resource) return { effect: 'SKIP' };

    const actionEnum = action as PermissionAction;

    // 1. Department Access Check
    if (
      actionEnum === PermissionAction.DEPARTMENT_UPDATE ||
      actionEnum === PermissionAction.DEPARTMENT_READ
    ) {
      const resourceId = this.getSafeProperty(resource, 'id');
      if (resourceId && resourceId !== user.departmentId) {
        return {
          effect: 'DENY',
          reason: { code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE, params: ['your own department'] },
        };
      }
    }

    // 2. User Access Check (within department scope)
    const resourceDeptId = this.resourceHelper.getResourceDepartmentId(resource);

    if (actionEnum === PermissionAction.USER_CREATE && !resourceDeptId) {
      return {
        effect: 'DENY',
        reason: { code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE, params: ['department is required'] },
      };
    }

    if (resourceDeptId && resourceDeptId !== user.departmentId) {
      return {
        effect: 'DENY',
        reason: { code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE, params: ['your department scope'] },
      };
    }

    // 3. Manager Update Restriction
    if (actionEnum === PermissionAction.USER_UPDATE) {
      const updateData = (resource as WrappedResource).new || (resource as Record<string, unknown>);
      const restrictedFields = Object.keys(updateData).filter(
        (key) => key !== 'id' && !this.ALLOWED_MANAGER_UPDATE_FIELDS.has(key),
      );

      if (restrictedFields.length > 0) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['Managers can only update basic info, department, position and status'],
          },
        };
      }
    }

    return { effect: 'SKIP' };
  }

  private getSafeProperty(obj: unknown, key: string): unknown {
    if (obj && typeof obj === 'object' && obj !== null && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }
}
