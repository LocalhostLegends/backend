import { Injectable } from '@nestjs/common';
import { UserRole } from '@common/enums/user-role.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyRule } from '../interfaces/policy-rule.interface';
import { PolicyResult, PermissionResource } from '../permissions.service';

@Injectable()
export class CalendarRule implements PolicyRule {
  priority = 50;

  supports(action: string): boolean {
    return [
      PermissionAction.CALENDAR_CREATE,
      PermissionAction.CALENDAR_UPDATE,
      PermissionAction.CALENDAR_DELETE,
    ].includes(action as PermissionAction);
  }

  check(
    user: AuthorizedUser,
    _action: string,
    _resource?: PermissionResource | null,
  ): PolicyResult {
    if (
      user.roles.some((role) =>
        [
          UserRole.HR,
          UserRole.ADMIN,
          UserRole.SUPER_ADMIN,
          UserRole.MANAGER,
          UserRole.EMPLOYEE,
        ].includes(role),
      )
    ) {
      return { effect: 'ALLOW' };
    }

    return { effect: 'SKIP' };
  }
}
