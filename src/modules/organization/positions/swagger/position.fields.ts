import { UUID_EXAMPLE } from '@/common/constants/app.constants';
import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

export const PositionFields = {
  id: { example: UUID_EXAMPLE, description: 'Position id' },
  title: { example: 'Senior Developer', description: 'Position title' },
  description: {
    example: 'Senior software developer position',
    description: 'Position description',
  },
} as const satisfies SwaggerFieldsMap;
