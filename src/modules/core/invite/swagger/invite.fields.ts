import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { InviteStatus } from '@common/enums/invite-status.enum';

const BaseInviteFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Invite id',
  },
  token: {
    description: 'Invite activation token',
    example: 'abc123-def456',
  },
  status: {
    enum: InviteStatus,
    description: 'Invite status',
    example: InviteStatus.PENDING,
  },
  invitedById: {
    example: UUID_EXAMPLE,
    description: 'Invite sender id',
  },
  expiresAt: {
    description: 'Invite expires date',
    example: '2024-12-31T23:59:59.999Z',
  },
  acceptedAt: {
    description: 'Invite accepted date',
  },
} as const satisfies SwaggerFieldsMap;

export const InviteFields = {
  ...BaseInviteFields,
  validateResponse: {
    id: UUID_EXAMPLE,
    email: 'user@example.com',
    role: 'MANAGER',
    status: InviteStatus.PENDING,
    expiresAt: '2024-12-31T23:59:59.999Z',
  },
  acceptBodyExample: {
    token: 'abc123-def456',
    password: 'StrongP@ssw0rd123',
    firstName: 'John',
    lastName: 'Doe',
  },
} as const;
