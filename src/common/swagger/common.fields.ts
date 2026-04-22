import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

export const CommonFields = {
  password: {
    example: 'StrongPassword123456',
    description: 'Password',
  },
  email: {
    example: 'employee@techcorp.com',
    description: 'Email address',
  },
  phone: {
    example: '+380501234567',
    description: 'Phone number',
  },
  timezone: {
    example: 'UTC',
    description: 'Timezone',
  },
  country: {
    example: 'USA',
    description: 'Country',
  },
  city: {
    example: 'New York',
    description: 'City',
  },
  address: {
    example: '123 Main St',
    description: 'Address',
  },
  website: {
    example: 'https://techcorp.com',
    description: 'Website',
  },
  taxId: {
    example: 'LV40001234567',
    description: 'Tax id (TIN/VAT ID, depending on jurisdiction)',
  },
  createdAt: {
    description: 'Created date',
  },
  updatedAt: {
    description: 'Updated date',
  },
} as const satisfies SwaggerFieldsMap;
