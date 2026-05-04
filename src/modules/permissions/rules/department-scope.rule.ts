import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { Department } from '@database/entities/department.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';
import { ResourceHelper } from '../utils/resource-helper.service';

function isDepartment(value: unknown): value is Department {
  return value instanceof Department;
}

function isPermissionResource(value: unknown): value is PermissionResource {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as PermissionResource).id === 'string'
  );
}

function isWrappedResource(value: unknown): value is { new: unknown; old?: unknown } {
  return typeof value === 'object' && value !== null && 'new' in value && value.new !== undefined;
}

function isUpdateableObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

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
    const resourceId = this.getResourceId(resource);

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

    if (actionEnum === PermissionAction.USER_UPDATE) {
      const updateData = this.extractUpdateData(resource);

      if (updateData && Object.keys(updateData).length > 0) {
        const hasRestrictedFields = Object.keys(updateData).some(
          (key) => key !== 'id' && !this.ALLOWED_MANAGER_UPDATE_FIELDS.has(key),
        );

        if (hasRestrictedFields) {
          return {
            effect: 'DENY',
            reason: {
              code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
              params: ['Managers can only update basic info, department, position and status'],
            },
          };
        }
      }
    }

    return { effect: 'SKIP' };
  }

  private getResourceId(resource: PermissionResource | Department): string | undefined {
    if (isDepartment(resource)) {
      return resource.id;
    }

    if (isPermissionResource(resource) && typeof resource.id === 'string') {
      return resource.id;
    }

    return undefined;
  }

  private extractUpdateData(resource: PermissionResource): Record<string, unknown> | null {
    if (isWrappedResource(resource) && isUpdateableObject(resource.new)) {
      const { id: _id, ...updates } = resource.new;
      return updates;
    }

    if (isUpdateableObject(resource)) {
      const { id: _id, ...updates } = resource;
      return updates;
    }

    return null;
  }
}
