import { UUID_EXAMPLE } from '@/common/constants/common.constants';
import { SwaggerFieldsMap } from '@common/types/common.types';

export const CompanyFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Company id',
  },
  name: {
    example: 'Tech Corp',
    description: 'Company name',
  },
  subdomain: {
    example: 'techcorp',
    description: 'Company unique subdomain',
  },
  logoUrl: {
    example: 'https://logo.com/logo.png',
    description: 'Company logo',
  },
  isActive: {
    description: 'Company active status',
  },
  subscriptionPlan: {
    example: 'business',
    description: 'Company subscription plan',
  },
  subscriptionExpiresAt: {
    example: '2027-12-31T00:00:00.000Z',
    description:
      'Date and time when the company subscription expires; null if no expiration is set',
  },
  employeeCount: {
    description: 'Company employees count',
  },
} as const satisfies SwaggerFieldsMap;
