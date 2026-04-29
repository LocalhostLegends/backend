import { SwaggerFieldsMap } from '@common/types/common.types';

export const AuthFields = {
  accessToken: {
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token',
  },
  activationToken: {
    description: 'Activation token from email',
  },
} as const satisfies SwaggerFieldsMap;
