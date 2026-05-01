import { Injectable } from '@nestjs/common';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PolicyResult, PermissionResource } from '../permissions.service';
import { ExceptionCode } from '@common/exceptions/exception-codes';

@Injectable()
export class SelfAccessRule implements PolicyRule {
  priority = 10;

  private readonly ALLOWED_SELF_UPDATE_FIELDS = ['firstName', 'lastName', 'phone', 'avatar'];

  supports(action: string): boolean {
    return [PermissionAction.USER_READ, PermissionAction.USER_UPDATE].includes(
      action as PermissionAction,
    );
  }

  check(user: AuthorizedUser, action: string, resource?: PermissionResource | null): PolicyResult {
    const resourceId = resource?.id;
    if (!resourceId || resourceId !== user.id) return { effect: 'SKIP' };

    const actionEnum = action as PermissionAction;

    if (actionEnum === PermissionAction.USER_READ) {
      return { effect: 'ALLOW' };
    }

    if (actionEnum === PermissionAction.USER_UPDATE) {
      const updateData = resource.new || resource;
      const updateKeys = Object.keys(updateData as object).filter((key) => key !== 'id');

      const hasRestrictedFields = updateKeys.some(
        (key) => !this.ALLOWED_SELF_UPDATE_FIELDS.includes(key),
      );

      if (hasRestrictedFields) {
        return {
          effect: 'DENY',
          reason: {
            code: ExceptionCode.AUTH_FORBIDDEN_RESOURCE,
            params: ['Only basic profile fields can be updated by yourself'],
          },
        };
      }

      return { effect: 'ALLOW' };
    }

    return { effect: 'SKIP' };
  }
}
