import { Injectable } from '@nestjs/common';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionResource } from '../permissions.service';

type WrappedResource = {
  new?: unknown;
  old?: unknown;
} & Record<string, unknown>;

@Injectable()
export class ResourceHelper {
  getResourceCompanyId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    const wrapped = resource as WrappedResource;

    if (wrapped.new && this.isPermissionResource(wrapped.new)) {
      const companyId = this._extractString(wrapped.new, 'companyId');
      if (companyId) return companyId;

      const company = this._extractObject(wrapped.new, 'company');
      const companyIdFromObj = this._extractString(company, 'id');
      if (companyIdFromObj) return companyIdFromObj;
    }

    if (wrapped.old && this.isPermissionResource(wrapped.old)) {
      const fromOld = this.getResourceCompanyId(wrapped.old);
      if (fromOld) return fromOld;
    }

    if (typeof wrapped.companyId === 'string') return wrapped.companyId;

    const company = wrapped.company as Record<string, unknown> | null | undefined;
    if (company && typeof company.id === 'string') return company.id;

    if (resource instanceof Company) return resource.id;

    const rawId = this._extractString(resource, 'companyId');
    if (rawId) return rawId;

    return null;
  }

  getResourceDepartmentId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    const wrapped = resource as WrappedResource;

    if (wrapped.new && this.isPermissionResource(wrapped.new)) {
      const deptId = this._extractString(wrapped.new, 'departmentId');
      if (deptId) return deptId;

      const dept = this._extractObject(wrapped.new, 'department');
      const deptIdFromObj = this._extractString(dept, 'id');
      if (deptIdFromObj) return deptIdFromObj;
    }

    if (wrapped.old && this.isPermissionResource(wrapped.old)) {
      const fromOld = this.getResourceDepartmentId(wrapped.old);
      if (fromOld) return fromOld;
    }

    if (typeof wrapped.departmentId === 'string') return wrapped.departmentId;

    const dept = wrapped.department as Record<string, unknown> | null | undefined;
    if (dept && typeof dept.id === 'string') return dept.id;

    if (resource instanceof Department) return resource.id;

    const rawId = this._extractString(resource, 'departmentId');
    if (rawId) return rawId;

    return null;
  }

  getResourceRole(resource: PermissionResource | null | undefined): UserRole | null {
    if (!resource) return null;

    const wrapped = resource as WrappedResource;

    if (wrapped.new && this.isPermissionResource(wrapped.new)) {
      const role = this._extractString(wrapped.new, 'role');
      if (this._isValidRole(role)) return role;
    }

    if (wrapped.old && this.isPermissionResource(wrapped.old)) {
      const role = this._extractString(wrapped.old, 'role');
      if (this._isValidRole(role)) return role;
    }

    if (this._isValidRole(wrapped.role)) return wrapped.role;

    const rawRole = this._extractString(resource, 'role');
    if (this._isValidRole(rawRole)) return rawRole;

    return null;
  }

  private isPermissionResource(value: unknown): value is PermissionResource {
    if (!value || typeof value !== 'object') return false;

    const obj = value as Record<string, unknown>;

    return (
      typeof obj.id === 'string' ||
      typeof obj.companyId === 'string' ||
      typeof obj.role === 'string' ||
      obj instanceof Company ||
      obj instanceof Department
    );
  }

  private _extractString(obj: unknown, key: string): string | null {
    if (obj && typeof obj === 'object' && key in obj) {
      const value = (obj as Record<string, unknown>)[key];
      return typeof value === 'string' ? value : null;
    }
    return null;
  }

  private _extractObject(obj: unknown, key: string): Record<string, unknown> | null {
    if (obj && typeof obj === 'object' && key in obj) {
      const value = (obj as Record<string, unknown>)[key];
      return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
    }
    return null;
  }

  private _isValidRole(role: unknown): role is UserRole {
    if (typeof role !== 'string') return false;
    return Object.values(UserRole).includes(role as UserRole);
  }
}
