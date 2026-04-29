import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { InviteStatus } from '@/common/enums/invite-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { CommonFields } from '@common/swagger/common.fields';
import { InviteFields } from '@modules/core/invite/swagger/invite.fields';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class InviteResponseDto {
  @Expose()
  @ApiProperty(InviteFields.id)
  id: string;

  @Expose()
  @ApiProperty(CommonFields.email)
  email: string;

  @Expose()
  @ApiProperty(InviteFields.token)
  token: string;

  @Expose()
  @ApiProperty(InviteFields.status)
  status: InviteStatus;

  @Expose()
  @ApiProperty(UserFields.role)
  role: UserRole;

  @Expose()
  @ApiProperty(CompanyFields.id)
  companyId: string;

  @Expose()
  @ApiProperty(InviteFields.invitedById)
  invitedById: string;

  @Expose()
  @ApiPropertyOptional(DepartmentFields.id)
  departmentId: string | null;

  @Expose()
  @ApiPropertyOptional(PositionFields.id)
  positionId: string | null;

  @Expose()
  @ApiProperty(InviteFields.expiresAt)
  expiresAt: Date;

  @Expose()
  @ApiPropertyOptional(InviteFields.acceptedAt)
  acceptedAt: Date | null;
}
