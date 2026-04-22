import { SwaggerFieldsMap } from '@common/types/swagger-fields-map.type';
import { UUID_EXAMPLE } from '@/common/constants/app.constants';
import { InviteStatus } from '@database/enums/invite-status.enum';

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
