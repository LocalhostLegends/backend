import { Injectable } from '@nestjs/common';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionResource, WrappedResource } from '../permissions.service';

@Injectable()
export class ResourceHelper {
  getResourceCompanyId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    if (resource.new) {
      const fromNew = resource.new as WrappedResource;
      const companyId = fromNew.companyId || fromNew.company?.id;
      if (companyId) return companyId;
    }

    if (resource.old) {
      const fromOld = this.getResourceCompanyId(resource.old);
      if (fromOld) return fromOld;
    }

    if (resource.companyId) return resource.companyId;
    if (resource.company?.id) return resource.company.id;
    if (resource instanceof Company) return resource.id;

    return null;
  }

  getResourceDepartmentId(resource: PermissionResource | null | undefined): string | null {
    if (!resource) return null;

    if (resource.new) {
      const fromNew = resource.new as WrappedResource;
      const departmentId = fromNew.departmentId || fromNew.department?.id;
      if (departmentId) return departmentId;
    }

    if (resource.old) {
      const fromOld = this.getResourceDepartmentId(resource.old);
      if (fromOld) return fromOld;
    }

    if (resource.departmentId) return resource.departmentId;
    if (resource.department?.id) return resource.department.id;
    if (resource instanceof Department) return resource.id;

    return null;
  }

  getResourceRole(resource: PermissionResource | null | undefined): UserRole | null {
    if (!resource) return null;
    if (resource.new) {
      const fromNew = resource.new as WrappedResource;
      if (fromNew.role) return fromNew.role;
    }
    if (resource.old?.role) return resource.old.role;
    if (resource.role) return resource.role;

    return null;
  }
}
