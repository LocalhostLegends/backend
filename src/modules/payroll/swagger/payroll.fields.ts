import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { SwaggerFieldsMap } from '@common/types/common.types';

export const PayrollFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Entity UUID',
  },
  userId: {
    example: UUID_EXAMPLE,
    description: 'User UUID',
  },
  periodId: {
    example: UUID_EXAMPLE,
    description: 'Payroll period UUID',
  },
  bonusId: {
    example: UUID_EXAMPLE,
    description: 'Bonus UUID',
  },
  revisionId: {
    example: UUID_EXAMPLE,
    description: 'Salary revision request UUID',
  },
} as const satisfies SwaggerFieldsMap;
