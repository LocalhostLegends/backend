import { SetMetadata } from '@nestjs/common';
import { PermissionAction } from '@common/enums/permission-action.enum';

export const PERMISSION_KEY = 'permission';
export const RequirePermission = (action: PermissionAction) => SetMetadata(PERMISSION_KEY, action);
