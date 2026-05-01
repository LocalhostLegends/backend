import { Injectable } from '@nestjs/common';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionResource } from '../permissions.service';

@Injectable()
export class ResourceHelper {
  getResourceCompanyId(resource: PermissionResource): string | null {
    if (!resource) return null;
    if (resource.companyId) return resource.companyId;
    if (resource.company?.id) return resource.company.id;
    if (resource instanceof Company) return resource.id;
    if (resource.old) return this.getResourceCompanyId(resource.old);

    return null;
  }

  getResourceDepartmentId(resource: PermissionResource): string | null {
    if (!resource) return null;
    if (resource.departmentId) return resource.departmentId;
    if (resource.department?.id) return resource.department.id;
    if (resource instanceof Department) return resource.id;
    if (resource.old) return this.getResourceDepartmentId(resource.old);

    return null;
  }

  getResourceRole(resource: PermissionResource): UserRole | null {
    if (!resource) return null;
    if (resource.role) return resource.role;
    if (resource.old?.role) return resource.old.role;
    if (resource.new?.role) return resource.new.role as UserRole;

    return null;
  }
}
