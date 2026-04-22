import { UUID_EXAMPLE } from '@/common/constants/app.constants';
import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

export const DepartmentFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Department id',
  },
  name: {
    example: 'IT Department',
    description: 'Department name',
  },
  description: {
    example: 'Information Technology department',
    description: 'Department description',
  },
} as const satisfies SwaggerFieldsMap;
