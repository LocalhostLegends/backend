import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { InviteStatus } from '@common/enums/invite-status.enum';

export const InviteFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Invite id',
  },
  token: {
    description: 'Invite activation token',
  },
  status: {
    enum: InviteStatus,
    description: 'Invite status',
  },
  invitedById: {
    example: UUID_EXAMPLE,
    description: 'Invite sender id',
  },
  expiresAt: {
    description: 'Invite expires date',
  },
  acceptedAt: {
    description: 'Invite accepted date',
  },
} as const satisfies SwaggerFieldsMap;
