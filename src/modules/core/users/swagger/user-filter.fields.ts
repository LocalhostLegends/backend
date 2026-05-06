import { SwaggerFieldsMap } from '@common/types/common.types';

export const UserFilterFields = {
  search: {
    example: 'John',
    description: 'Search by name or email',
  },
  statuses: {
    description: 'Multiple statuses',
    isArray: true,
  },
  roles: {
    description: 'Multiple roles',
    isArray: true,
  },
  createdAfter: {
    description: 'Created after date',
  },
  createdBefore: {
    description: 'Created before date',
  },
  hiredAfter: {
    description: 'Hired after date',
  },
  hiredBefore: {
    description: 'Hired before date',
  },
  lastLoginAfter: {
    description: 'Last login after date',
  },
  lastLoginBefore: {
    description: 'Last login before date',
  },
  dobMonth: {
    description: 'Filter by month of birth (1-12)',
    example: '5',
  },
  pendingOnly: {
    description: 'Only invited users',
  },
  activeOnly: {
    description: 'Only active users',
  },
  blockedOnly: {
    description: 'Only blocked users',
  },
  withDeleted: {
    description: 'Include deleted users',
    default: false,
  },
} as const satisfies SwaggerFieldsMap;
