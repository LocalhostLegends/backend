import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ResendInviteDto {
  @ApiProperty({ example: 'uuid-of-invite' })
  @IsUUID()
  inviteId: string;
}