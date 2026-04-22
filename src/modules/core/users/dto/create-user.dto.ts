import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEmail, IsUUID } from 'class-validator';

import { UserRole } from '@common/enums/user-role.enum';
import { IsPassword, IsPhone } from '@common/decorators/common-fields.decorators';
import { CommonFields } from '@common/swagger/common.fields';
import {
  IsUserFirstName,
  IsUserLastName,
  IsUserRole,
} from '@modules/core/users/decorators/user-fields.decorators';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';
import { DepartmentFields } from '@modules/organization/departments/swagger/department.fields';
import { PositionFields } from '@modules/organization/positions/swagger/position.fields';

export class CreateUserDto {
  @ApiProperty(UserFields.firstName)
  @IsUserFirstName()
  firstName: string;

  @ApiProperty(UserFields.lastName)
  @IsUserLastName()
  lastName: string;

  @ApiProperty(CommonFields.email)
  @IsEmail()
  email: string;

  @ApiPropertyOptional(CommonFields.password)
  @IsOptional()
  @IsPassword()
  password?: string;

  @ApiPropertyOptional(UserFields.role)
  @IsOptional()
  @IsUserRole()
  role?: UserRole;

  @ApiPropertyOptional(CompanyFields.id)
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @ApiPropertyOptional(DepartmentFields.id)
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional(PositionFields.id)
  @IsOptional()
  @IsUUID()
  positionId?: string;

  @ApiPropertyOptional(CommonFields.phone)
  @IsOptional()
  @IsPhone()
  phone?: string;

  @ApiPropertyOptional(UserFields.sendInvitation)
  @IsOptional()
  @IsBoolean()
  sendInvitation?: boolean = true;
}
