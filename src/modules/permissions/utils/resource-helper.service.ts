import { Injectable } from '@nestjs/common';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionResource, WrappedResource, IOwnable } from '../types/permissions.types';

@Injectable()
export class ResourceHelper {
  getResourceCompanyId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    if (this.isWrappedResource(resource)) {
      if (resource.new) {
        const id = this.extractId(resource.new, 'companyId', 'company');
        if (id) return id;
      }
      if (resource.old) {
        const fromOld = this.getResourceCompanyId(resource.old);
        if (fromOld) return fromOld;
      }
      if (typeof resource.companyId === 'string') return resource.companyId;
    }

    return this.extractId(resource, 'companyId', 'company');
  }

  getResourceDepartmentId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    if (this.isWrappedResource(resource)) {
      if (resource.new) {
        const id = this.extractId(resource.new, 'departmentId', 'department');
        if (id) return id;
      }
      if (resource.old) {
        const fromOld = this.getResourceDepartmentId(resource.old);
        if (fromOld) return fromOld;
      }
      if (typeof resource.departmentId === 'string') return resource.departmentId;
    }

    return this.extractId(resource, 'departmentId', 'department');
  }

  getResourceUserId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    if (this.isWrappedResource(resource)) {
      if (resource.new) {
        const id = this.extractId(resource.new, 'userId', 'user');
        if (id) return id;
      }
      if (resource.old) {
        const fromOld = this.getResourceUserId(resource.old);
        if (fromOld) return fromOld;
      }
      if (typeof resource.userId === 'string') return resource.userId;
    }

    return this.extractId(resource, 'userId', 'user');
  }

  getResourceRoles(resource: PermissionResource | null | undefined): UserRole[] {
    if (!resource) return [];

    if (this.isWrappedResource(resource)) {
      if (resource.new && Array.isArray(resource.new.roles)) {
        return this.filterValidRoles(resource.new.roles);
      }
      if (resource.roles) return resource.roles;
      if (resource.old) return this.getResourceRoles(resource.old);
    }

    if (this.isOwnable(resource) && Array.isArray(resource.roles)) {
      return this.filterValidRoles(resource.roles);
    }

    // Try to extract roles from unknown object
    const rawRoles = this.getSafeProperty(resource, 'roles');
    if (Array.isArray(rawRoles)) {
      return this.filterValidRoles(rawRoles);
    }

    return [];
  }

  private extractId(resource: object, fieldKey: string, objectKey: string): string | null {
    // 1. Check direct field (e.g., companyId)
    const directValue = this.getSafeProperty(resource, fieldKey);
    if (typeof directValue === 'string') return directValue;
    if (typeof directValue === 'number') return String(directValue);

    // 2. Check nested object (e.g., company.id)
    const nested = this.getSafeProperty(resource, objectKey);
    if (nested && typeof nested === 'object') {
      const nestedId = this.getSafeProperty(nested, 'id');
      if (typeof nestedId === 'string') return nestedId;
      if (typeof nestedId === 'number') return String(nestedId);
    }

    // 3. Entity check
    if (resource instanceof Company || resource instanceof Department) {
      return resource.id;
    }

    return null;
  }

  private isWrappedResource(resource: object): resource is WrappedResource {
    return 'new' in resource || 'old' in resource;
  }

  private isOwnable(resource: object): resource is IOwnable {
    return 'companyId' in resource || 'departmentId' in resource || 'roles' in resource;
  }

  private getSafeProperty(obj: object, key: string): unknown {
    if (key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }

  private filterValidRoles(roles: unknown[]): UserRole[] {
    return roles.filter(
      (r): r is UserRole =>
        typeof r === 'string' && Object.values(UserRole).includes(r as UserRole),
    );
  }
}
