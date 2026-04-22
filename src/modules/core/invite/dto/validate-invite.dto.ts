import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

import { InviteFields } from '@modules/core/invite/swagger/invite.fields';

export class ValidateInviteDto {
  @ApiProperty(InviteFields.token)
  @IsUUID()
  token: string;
}
