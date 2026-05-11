import { UUID_EXAMPLE } from '@/common/constants/common.constants';
import { SwaggerFieldsMap } from '@common/types/common.types';

export const OnboardingFields = {
  templateId: {
    example: UUID_EXAMPLE,
    description: 'Onboarding template ID',
  },
  employeeId: {
    example: UUID_EXAMPLE,
    description: 'Employee user ID',
  },
  name: {
    example: 'Backend Developer Onboarding',
    description: 'Template name',
  },
  description: {
    example: 'Standard onboarding process for new backend developers',
    description: 'Template description',
  },
  order: {
    example: 1,
    description: 'Step order in the template',
  },
  durationDays: {
    example: 3,
    description: 'Number of days from start date to complete the step',
  },
} as const satisfies SwaggerFieldsMap;
