import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

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
