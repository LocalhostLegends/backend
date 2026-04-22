import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

export const PaginationQueryFields = {
  page: {
    example: 1,
    description: 'Page number',
  },
  limit: {
    example: 10,
    description: 'Items per page',
  },
  sortBy: {
    example: 'createdAt',
    description: 'Sort field',
  },
  sortOrder: {
    example: 'DESC',
    description: 'Sort order',
  },
} as const satisfies SwaggerFieldsMap;
