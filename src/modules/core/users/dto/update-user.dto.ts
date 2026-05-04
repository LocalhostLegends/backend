import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, IsEmail, IsUrl } from 'class-validator';

import { UserStatus } from '@/common/enums/user-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { IsDateQuery, IsPhone } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';
import {
  IsUserFirstName,
  IsUserLastName,
  IsUserRoles,
  IsUserStatus,
} from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class UpdateUserDto {
  @ApiPropertyOptional(UserFields.firstName)
  @IsOptional()
  @IsUserFirstName()
  firstName?: string;

  @ApiPropertyOptional(UserFields.lastName)
  @IsOptional()
  @IsUserLastName()
  lastName?: string;

  @ApiPropertyOptional(CommonFields.email)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ ...UserFields.roles, isArray: true })
  @IsOptional()
  @IsUserRoles()
  roles?: UserRole[];

  @ApiPropertyOptional(UserFields.dateOfBirth)
  @IsOptional()
  @IsDateQuery()
  dateOfBirth?: Date | null;

  @ApiPropertyOptional(UserFields.hireDate)
  @IsOptional()
  @IsDateQuery()
  hireDate?: Date;

  @ApiPropertyOptional(UserFields.status)
  @IsOptional()
  @IsUserStatus()
  status?: UserStatus;

  @ApiPropertyOptional(DepartmentFields.id)
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @ApiPropertyOptional(PositionFields.id)
  @IsOptional()
  @IsUUID()
  positionId?: string | null;

  @ApiPropertyOptional(CommonFields.phone)
  @IsOptional()
  @IsPhone()
  phone?: string;

  @ApiPropertyOptional(UserFields.avatar)
  @IsOptional()
  @IsUrl()
  avatar?: string | null;
}
