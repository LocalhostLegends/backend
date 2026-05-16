import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionsService } from '../permissions.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { RESOURCE_KEY, ResourceMetadata } from '../decorators/resource.decorator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionResource, WrappedResource, IOwnable } from '../types/permissions.types';

interface RequestWithUser extends Request {
  user: AuthorizedUser;
  resource?: PermissionResource;
}

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionsService: PermissionsService,
    private readonly moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const action = this.reflector.getAllAndOverride<PermissionAction>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!action) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    if (!user) return false;

    const resourceMetadata = this.reflector.getAllAndOverride<ResourceMetadata>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const resource = await this.loadAndBuildResource(request, user, resourceMetadata);
    request.resource = resource;

    try {
      await this.permissionsService.assertCan(user, action, resource);
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      const message = error instanceof Error ? error.message : 'Forbidden';
      throw new ForbiddenException(message);
    }
  }

  private async loadAndBuildResource(
    request: RequestWithUser,
    user: AuthorizedUser,
    metadata?: ResourceMetadata,
  ): Promise<PermissionResource | undefined> {
    const dbResource = await this.fetchResourceFromDb(request, metadata);
    const bodyResource = this.extractResourceFromBody(request);

    if (!dbResource && !bodyResource) {
      return this.shouldAddUserContext(undefined, user) ? { companyId: user.companyId } : undefined;
    }

    let finalResource: PermissionResource;

    if (dbResource && bodyResource) {
      finalResource = {
        ...dbResource,
        old: dbResource,
        new: bodyResource,
      };
    } else {
      finalResource = (dbResource || bodyResource) as PermissionResource;
    }

    if (this.shouldAddUserContext(finalResource, user)) {
      // Use type guard/assertion to add companyId safely
      if (this.isOwnable(finalResource)) {
        finalResource.companyId = user.companyId;
      } else {
        finalResource = { ...finalResource, companyId: user.companyId };
      }
    }

    return finalResource;
  }

  private async fetchResourceFromDb(
    request: RequestWithUser,
    metadata?: ResourceMetadata,
  ): Promise<WrappedResource | undefined> {
    if (!metadata) return undefined;

    const paramName = metadata.paramName || 'id';
    const resourceIdRaw =
      request.params[paramName] || this.getSafeProperty(request.body, paramName);

    if (typeof resourceIdRaw !== 'string') return undefined;

    try {
      const repository = this.moduleRef.get<Repository<Record<string, unknown>>>(
        getRepositoryToken(metadata.type),
        { strict: false },
      );

      const entity = await repository.findOne({
        where: { id: resourceIdRaw },
        relations: ['company', 'department', ...(metadata.relations || [])],
      });

      if (!entity) return undefined;

      return {
        ...entity,
        id: String(entity.id),
        companyId: this.extractId(entity, 'company'),
        departmentId: this.extractId(entity, 'department'),
        roles: Array.isArray(entity.roles) ? (entity.roles as UserRole[]) : undefined,
      };
    } catch {
      return undefined;
    }
  }

  private extractResourceFromBody(request: RequestWithUser): Record<string, unknown> | undefined {
    if (['POST', 'PATCH', 'PUT'].includes(request.method)) {
      return request.body as Record<string, unknown>;
    }
    return undefined;
  }

  private extractId(entity: Record<string, unknown>, key: string): string | undefined {
    const directId = entity[key + 'Id'];
    if (typeof directId === 'string') return directId;

    const nested = entity[key];
    if (nested && typeof nested === 'object' && 'id' in nested) {
      const nestedId = (nested as Record<string, unknown>).id;
      if (typeof nestedId === 'string') return nestedId;
      if (typeof nestedId === 'number') return String(nestedId);
    }
    return undefined;
  }

  private shouldAddUserContext(
    resource: PermissionResource | undefined,
    user: AuthorizedUser,
  ): boolean {
    if (!user.companyId) return false;
    if (!resource) return true;

    // Check if company information is missing
    const companyId = this.getSafeProperty(resource, 'companyId');
    const company = this.getSafeProperty(resource, 'company');

    return !companyId && !company;
  }

  private getSafeProperty(obj: unknown, key: string): unknown {
    if (obj && typeof obj === 'object' && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }

  private isOwnable(resource: PermissionResource): resource is IOwnable {
    return typeof resource === 'object' && resource !== null;
  }
}
