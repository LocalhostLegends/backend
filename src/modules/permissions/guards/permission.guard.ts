import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector, ModuleRef } from '@nestjs/core';
import { Request } from 'express';
import { Repository } from 'typeorm';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService, PermissionResource, WrappedResource } from '../permissions.service';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { RESOURCE_KEY, ResourceMetadata } from '../decorators/resource.decorator';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthorizedUser } from '@modules/core/users/users.types';

interface RequestWithUser extends Request {
  user: AuthorizedUser;
  resource?: PermissionResource;
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

    if (!action) return true;

    const resourceMetadata = this.reflector.getAllAndOverride<ResourceMetadata>(RESOURCE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) return false;

    let resource: PermissionResource | undefined = undefined;

    if (resourceMetadata) {
      const paramName = resourceMetadata.paramName || 'id';
      const resourceId = request.params[paramName];

      if (resourceId) {
        try {
          const repository = this.moduleRef.get<Repository<Record<string, any>>>(
            getRepositoryToken(resourceMetadata.type),
            {
              strict: false,
            },
          );
          if (repository) {
            const found = await repository.findOne({
              where: { id: resourceId },
              relations: ['company', 'department'],
            });

            if (found) {
              resource = found as WrappedResource;
              request.resource = resource;
            }
          }
        } catch {
          // If the resource failed to load, continue without it (rules may return SKIP or DENY)
        }
      }
    }

    const resourceFromBody =
      request.method === 'POST' || request.method === 'PATCH' || request.method === 'PUT'
        ? (request.body as WrappedResource)
        : undefined;

    let finalResource: PermissionResource | undefined = undefined;

    const res = resource;
    const body = resourceFromBody;

    if (res && body) {
      finalResource = {
        id: res.id,
        old: res,
        new: body,
        role: body.role ?? res.role,
        companyId: body.companyId ?? (res.company?.id || res.companyId),
        departmentId: body.departmentId ?? (res.department?.id || res.departmentId),
      };
    } else if (resource) {
      finalResource = resource;
    } else {
      finalResource = resourceFromBody;
    }

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
}
