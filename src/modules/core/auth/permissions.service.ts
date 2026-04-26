import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@common/types/authorized-user.type';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { User } from '@database/entities/user.entity';
import { Invite } from '@database/entities/invite.entity';

export type PermissionResource = Company | Department | Position | User | Invite;

@Injectable()
export class PermissionsService {
  /**
   * Safe check for company ownership
   */
  private getResourceCompanyId(resource: PermissionResource): string | undefined {
    if (resource instanceof Company) return resource.id;
    if (
      resource instanceof Department ||
      resource instanceof Position ||
      resource instanceof User ||
      resource instanceof Invite
    ) {
      return resource.company?.id;
    }
    return undefined;
  }

  /**
   * Safe check for department ownership
   */
  private getResourceDepartmentId(resource: PermissionResource): string | undefined {
    if (resource instanceof User || resource instanceof Department) {
      return resource instanceof User ? resource.department?.id : resource.id;
    }
    if (resource instanceof Invite) {
      return resource.departmentId || undefined;
    }
    return undefined;
  }

  /**
   * Safe check for role (User or Invite)
   */
  private getResourceRole(resource: PermissionResource): UserRole | string | undefined {
    if (resource instanceof User || resource instanceof Invite) {
      return resource.role;
    }
    return undefined;
  }

  /**
   * Check if user can perform an action on a resource
   */
  getDenialReason(
    user: AuthorizedUser,
    action: PermissionAction,
    resource?: PermissionResource | null,
  ): string | null {
    if (user.role === UserRole.SUPER_ADMIN) return null;
    if (!user.companyId) return ErrorMessages.FORBIDDEN;

    if (resource) {
      const resourceCompanyId = this.getResourceCompanyId(resource);
      if (resourceCompanyId && resourceCompanyId !== user.companyId) {
        if (action.startsWith('department.'))
          return ErrorMessages.DEPARTMENT_NOT_IN_COMPANY(resource.id, user.companyId);
        if (action.startsWith('position.'))
          return ErrorMessages.POSITION_NOT_IN_COMPANY(resource.id, user.companyId);
        if (action.startsWith('invite.'))
          return ErrorMessages.INVITE_NOT_IN_COMPANY(resource.id, user.companyId);
        return ErrorMessages.FORBIDDEN_NON_OWNERSHIP_ACCESS('this resource');
      }

      // MANAGER Scope: Department level
      if (user.role === UserRole.MANAGER && user.departmentId) {
        if (action === PermissionAction.DEPARTMENT_UPDATE && resource.id !== user.departmentId) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS('your own department');
        }

        const resourceDeptId = this.getResourceDepartmentId(resource);
        if (
          (action === PermissionAction.USER_READ || action === PermissionAction.USER_UPDATE) &&
          resourceDeptId &&
          resourceDeptId !== user.departmentId
        ) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS('your department employees');
        }
      }
    }

    const roleDenied = (requiredRoles: UserRole[]) => {
      if (!requiredRoles.includes(user.role)) {
        return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(requiredRoles.join(' or '));
      }
      return null;
    };

    const resourceRole = resource ? this.getResourceRole(resource) : undefined;

    switch (action) {
      case PermissionAction.COMPANY_READ:
        return null;
      case PermissionAction.COMPANY_UPDATE:
      case PermissionAction.COMPANY_DELETE:
        return roleDenied([UserRole.ADMIN]);

      case PermissionAction.DEPARTMENT_CREATE:
      case PermissionAction.DEPARTMENT_DELETE:
        return roleDenied([UserRole.ADMIN, UserRole.HR]);
      case PermissionAction.DEPARTMENT_UPDATE:
        return roleDenied([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]);
      case PermissionAction.DEPARTMENT_READ:
        return null;

      case PermissionAction.POSITION_CREATE:
      case PermissionAction.POSITION_UPDATE:
      case PermissionAction.POSITION_DELETE:
        return roleDenied([UserRole.ADMIN, UserRole.HR]);
      case PermissionAction.POSITION_READ:
        return null;

      case PermissionAction.USER_READ:
        if (user.role === UserRole.HR && resourceRole === UserRole.ADMIN) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(UserRole.ADMIN, false);
        }
        if (
          user.role === UserRole.MANAGER &&
          (resourceRole === UserRole.ADMIN || resourceRole === UserRole.HR)
        ) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS('HR or ADMIN', false);
        }
        if (user.role === UserRole.MANAGER && user.departmentId && resource instanceof User) {
          const targetDeptId = resource.department?.id;
          if (targetDeptId && targetDeptId !== user.departmentId) {
            return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS('employees of your department');
          }
        }
        return null;

      case PermissionAction.USER_CREATE:
        return roleDenied([UserRole.ADMIN, UserRole.HR]);
      case PermissionAction.USER_UPDATE:
      case PermissionAction.USER_DELETE:
        if (user.role === UserRole.HR && resourceRole === UserRole.ADMIN) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS(UserRole.ADMIN, false);
        }
        if (
          user.role === UserRole.MANAGER &&
          (resourceRole === UserRole.ADMIN || resourceRole === UserRole.HR)
        ) {
          return ErrorMessages.FORBIDDEN_RESOURCE_ACCESS('HR or ADMIN', false);
        }
        return roleDenied([UserRole.ADMIN, UserRole.HR, UserRole.MANAGER]);

      case PermissionAction.USER_MANAGE_ROLES:
        return roleDenied([UserRole.ADMIN]);

      case PermissionAction.INVITE_CREATE:
      case PermissionAction.INVITE_RESEND:
      case PermissionAction.INVITE_CANCEL:
        if (user.role === UserRole.HR && resourceRole === UserRole.ADMIN) {
          return ErrorMessages.FORBIDDEN_INVITE_ADMIN;
        }
        return roleDenied([UserRole.ADMIN, UserRole.HR]);
      case PermissionAction.INVITE_READ:
        return null;

      default:
        return ErrorMessages.FORBIDDEN;
    }
  }

  can(
    user: AuthorizedUser,
    action: PermissionAction,
    resource?: PermissionResource | null,
  ): boolean {
    return this.getDenialReason(user, action, resource) === null;
  }

  assertCan(
    user: AuthorizedUser,
    action: PermissionAction,
    resource?: PermissionResource | null,
    customMessage?: string,
  ): void {
    const denialReason = this.getDenialReason(user, action, resource);
    if (denialReason !== null) {
      throw new ForbiddenException(customMessage || denialReason);
    }
  }
}
