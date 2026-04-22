import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEmail, IsUUID } from 'class-validator';

import { UserRole } from '@common/enums/user-role.enum';
import { CommonFields } from '@common/swagger/common.fields';
import { IsUserRole } from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class CreateInviteDto {
  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiProperty(UserFields.role)
  @IsUserRole()
  role: UserRole;

  @ApiPropertyOptional(DepartmentFields.id)
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional(PositionFields.id)
  @IsOptional()
  @IsUUID()
  positionId?: string;
}
