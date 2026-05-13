import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { SwaggerFieldsMap } from '@common/types/common.types';

export const StructureFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Entity id (department or employee)',
  },
  title: {
    example: 'Engineering',
    description: 'Entity title',
  },
  subtitle: {
    example: 'Software Engineer',
    description: 'Entity subtitle (position or code)',
  },
  avatar: {
    example: 'https://example.com/avatar.jpg',
    description: 'Avatar URL',
  },
} as const satisfies SwaggerFieldsMap;
