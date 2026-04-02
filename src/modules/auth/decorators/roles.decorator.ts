import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@/database/entities/user.entity.enums';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);