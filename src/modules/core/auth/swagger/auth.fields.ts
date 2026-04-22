import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';

export const AuthFields = {
  accessToken: {
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  },
  activationToken: {
    description: 'Activation token from email',
  },
} as const satisfies SwaggerFieldsMap;
