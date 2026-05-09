import { IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { InviteStatus } from '@common/enums/invite-status.enum';

export class InviteFilterDto {
  @ApiPropertyOptional({ enum: InviteStatus, description: 'Filter by invite status' })
  @IsOptional()
  @IsEnum(InviteStatus)
  status?: InviteStatus;
}
