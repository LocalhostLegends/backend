import { UserRole } from '@common/enums/user-role.enum';
import { UUID_EXAMPLE } from '@/common/constants/app.constants';
import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';
import { UserStatus } from '@database/enums/user-status.enum';

export const UserFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'User id',
  },
  firstName: {
    example: 'John',
    description: 'User first name',
  },
  lastName: {
    example: 'Doe',
    description: 'User last name',
  },
  role: {
    enum: UserRole,
    example: UserRole.HR,
    description: 'User role',
  },
  status: {
    enum: UserStatus,
    description: 'User status',
  },
  avatar: {
    example: 'https://example.com/avatar.jpg',
    description: 'Image url',
  },
  sendInvitation: {
    description: 'Whether to send the user an invitation',
  },
  department: {
    description: 'User department',
  },
  position: {
    description: 'User position',
  },
  company: {
    description: 'User company',
  },
  lastLoginAt: {
    description: 'Last login date',
  },
  fullName: {
    description: 'Full name (First name + Last name)',
  },
} as const satisfies SwaggerFieldsMap;
