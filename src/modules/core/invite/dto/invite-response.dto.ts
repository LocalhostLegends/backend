import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { InviteStatus } from '@database/enums/invite-status.enum';

export class InviteResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty()
  token: string;

  @Expose()
  @ApiProperty({ enum: InviteStatus })
  status: InviteStatus;

  @Expose()
  @ApiProperty()
  role: string;

  @Expose()
  @ApiProperty()
  companyId: string;

  @Expose()
  @ApiProperty()
  invitedById: string;

  @Expose()
  @ApiPropertyOptional()
  departmentId: string | null;

  @Expose()
  @ApiPropertyOptional()
  positionId: string | null;

  @Expose()
  @ApiProperty()
  expiresAt: Date;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional()
  acceptedAt: Date | null;
}
