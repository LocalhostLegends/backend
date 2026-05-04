import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { Repository, FindOptionsWhere, ObjectLiteral as TypeORMObjectLiteral } from 'typeorm';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService, PermissionResource, WrappedResource } from '../permissions.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { RESOURCE_KEY, ResourceMetadata } from '../decorators/resource.decorator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorizedUser } from '@modules/core/users/users.types';

interface RequestWithUser extends Request {
  user: AuthorizedUser;
  resource?: WrappedResource;
}

interface EntityWithRelations {
  id: string | number;
  companyId?: string | null;
  departmentId?: string | null;
  company?: { id: string | number } | null;
  department?: { id: string | number } | null;
  roles?: string[];
}

function isWrappedResource(resource: PermissionResource | undefined): resource is WrappedResource {
  return resource !== undefined && typeof resource === 'object' && 'id' in resource;
}

function isObjectLiteral(
  resource: PermissionResource | undefined,
): resource is Record<string, unknown> {
  return resource !== undefined && typeof resource === 'object' && !('id' in resource);
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<PermissionAction>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!action) {
      return true;
    }

    const resourceMetadata = this.reflector.getAllAndOverride<ResourceMetadata>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false;
    }

    const resource = await this.loadResource(request, resourceMetadata);
    const finalResource = this.buildFinalResource(request, resource, user);

    try {
      await this.permissionsService.assertCan(user, action, finalResource);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Forbidden';
      throw new ForbiddenException(message);
    }
  }

  private async loadResource(
    request: RequestWithUser,
    resourceMetadata: ResourceMetadata | undefined,
  ): Promise<WrappedResource | undefined> {
    if (!resourceMetadata) {
      return undefined;
    }

    const paramName = resourceMetadata.paramName || 'id';
    const resourceIdParam = request.params[paramName];
    const resourceId = typeof resourceIdParam === 'string' ? resourceIdParam : undefined;

    if (!resourceId) {
      return undefined;
    }

    try {
      const repository = this.moduleRef.get<Repository<TypeORMObjectLiteral>>(
        getRepositoryToken(resourceMetadata.type),
        { strict: false },
      );

      if (!repository) {
        return undefined;
      }

      const whereCondition: FindOptionsWhere<TypeORMObjectLiteral> = {
        id: resourceId,
      };

      const found = await repository.findOne({
        where: whereCondition,
        relations: ['company', 'department'],
      });

      if (!found) {
        return undefined;
      }

      const entity = found as unknown as EntityWithRelations;

      const resource: WrappedResource = {
        id: String(entity.id),
        companyId: this.extractCompanyIdFromEntity(entity),
        departmentId: this.extractDepartmentIdFromEntity(entity),
        company: entity.company ? { id: String(entity.company.id) } : null,
        department: entity.department ? { id: String(entity.department.id) } : null,
        roles: entity.roles as WrappedResource['roles'],
      };

      request.resource = resource;
      return resource;
    } catch {
      return undefined;
    }
  }

  private buildFinalResource(
    request: RequestWithUser,
    resource: WrappedResource | undefined,
    user: AuthorizedUser,
  ): PermissionResource | undefined {
    const resourceFromBody = this.getResourceFromBody(request);

    if (!resource && !resourceFromBody) {
      return undefined;
    }

    let finalResource: PermissionResource | undefined;

    if (resource && resourceFromBody) {
      finalResource = {
        id: resource.id,
        old: resource,
        new: resourceFromBody,
        roles: this.extractRolesFromBody(resourceFromBody.roles, resource.roles),
        companyId: this.extractCompanyIdFromBody(resourceFromBody, resource),
        departmentId: this.extractDepartmentIdFromBody(resourceFromBody, resource),
        company: resource.company,
        department: resource.department,
      };
    } else if (resource) {
      finalResource = resource;
    } else if (resourceFromBody) {
      finalResource = resourceFromBody;
    }

    if (finalResource && this.shouldAddUserCompanyId(finalResource, user)) {
      if (isWrappedResource(finalResource)) {
        finalResource = {
          ...finalResource,
          companyId: user.companyId,
        };
      } else if (isObjectLiteral(finalResource)) {
        finalResource = {
          ...finalResource,
          companyId: user.companyId,
        };
      }
    }

    return finalResource;
  }

  private getResourceFromBody(request: RequestWithUser): Record<string, unknown> | undefined {
    const methodsWithBody = ['POST', 'PATCH', 'PUT'];
    if (methodsWithBody.includes(request.method)) {
      return request.body as Record<string, unknown>;
    }
    return undefined;
  }

  private extractCompanyIdFromEntity(entity: EntityWithRelations): string | undefined {
    if (entity.companyId) {
      return entity.companyId;
    }
    if (entity.company?.id) {
      return String(entity.company.id);
    }
    return undefined;
  }

  private extractDepartmentIdFromEntity(entity: EntityWithRelations): string | undefined {
    if (entity.departmentId) {
      return entity.departmentId;
    }
    if (entity.department?.id) {
      return String(entity.department.id);
    }
    return undefined;
  }

  private extractRolesFromBody(
    bodyRoles: unknown,
    resourceRoles: string[] | undefined,
  ): string[] | undefined {
    if (
      Array.isArray(bodyRoles) &&
      bodyRoles.every((role: unknown): role is string => typeof role === 'string')
    ) {
      return bodyRoles;
    }
    return resourceRoles;
  }

  private extractCompanyIdFromBody(
    body: Record<string, unknown>,
    resource: WrappedResource,
  ): string | undefined {
    const bodyCompanyId = this.toSafeString(body.companyId);
    if (bodyCompanyId) {
      return bodyCompanyId;
    }

    const resourceCompanyId = this.extractNestedId(resource.company);
    if (resourceCompanyId) {
      return resourceCompanyId;
    }

    return resource.companyId ?? undefined;
  }

  private extractDepartmentIdFromBody(
    body: Record<string, unknown>,
    resource: WrappedResource,
  ): string | undefined {
    const bodyDepartmentId = this.toSafeString(body.departmentId);
    if (bodyDepartmentId) {
      return bodyDepartmentId;
    }

    const resourceDepartmentId = this.extractNestedId(resource.department);
    if (resourceDepartmentId) {
      return resourceDepartmentId;
    }

    return resource.departmentId ?? undefined;
  }

  private extractNestedId(obj: unknown): string | undefined {
    if (obj && typeof obj === 'object' && 'id' in obj) {
      const id = obj.id;
      if (typeof id === 'string') {
        return id;
      }
      if (typeof id === 'number') {
        return String(id);
      }
    }
    return undefined;
  }

  private toSafeString(value: unknown): string | undefined {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number') {
      return String(value);
    }
    if (value && typeof value === 'object' && 'id' in value) {
      const id = value.id;
      if (typeof id === 'string') {
        return id;
      }
      if (typeof id === 'number') {
        return String(id);
      }
    }
    return undefined;
  }

  private shouldAddUserCompanyId(resource: PermissionResource, user: AuthorizedUser): boolean {
    if (isWrappedResource(resource)) {
      const hasCompanyId = resource.companyId !== undefined && resource.companyId !== null;
      const hasCompany = resource.company !== undefined && resource.company !== null;
      return !hasCompanyId && !hasCompany && !!user.companyId;
    }

    if (isObjectLiteral(resource)) {
      const hasCompanyId =
        'companyId' in resource && resource.companyId !== undefined && resource.companyId !== null;
      const hasCompany =
        'company' in resource && resource.company !== undefined && resource.company !== null;
      return !hasCompanyId && !hasCompany && !!user.companyId;
    }

    return false;
  }
}
