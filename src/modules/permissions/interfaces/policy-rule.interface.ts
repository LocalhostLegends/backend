import { AuthorizedUser } from '@modules/core/users/users.types';
import { PolicyResult, PermissionResource } from '../permissions.service';

export interface PolicyRule {
  supports(action: string): boolean;

  check(
    user: AuthorizedUser,
    action: string,
    resource?: PermissionResource | null,
  ): Promise<PolicyResult> | PolicyResult;

  priority?: number;
}
