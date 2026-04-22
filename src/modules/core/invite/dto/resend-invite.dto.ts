import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { InviteFields } from '@modules/core/invite/swagger/invite.fields';

export class ResendInviteDto {
  @ApiProperty(InviteFields.id)
  @IsUUID()
  inviteId: string;
}
