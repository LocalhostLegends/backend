import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@database/enums/user-status.enum';
import { CommonFields } from '@common/swagger/common.fields';
import { DepartmentResponseDto } from '@modules/organization/departments/dto/department-response.dto';
import { PositionResponseDto } from '@modules/organization/positions/dto/position-response.dto';
import { CompanyResponseDto } from '@modules/organization/companies/dto/company-response.dto';
import { UserFields } from '@modules/core/users/swagger/user.fields';

export class UserResponseDto {
  @Expose()
  @ApiProperty(UserFields.id)
  id: string;

  @Expose()
  @ApiProperty(UserFields.firstName)
  firstName: string;

  @Expose()
  @ApiProperty(UserFields.lastName)
  lastName: string;

  @Expose()
  @ApiProperty(CommonFields.email)
  email: string;

  @Expose()
  @ApiProperty(UserFields.role)
  role: UserRole;

  @Expose()
  @ApiProperty(UserFields.status)
  status: UserStatus;

  @Expose()
  @ApiPropertyOptional(CommonFields.phone)
  phone: string | null;

  @Expose()
  @ApiPropertyOptional(UserFields.avatar)
  avatar: string | null;

  @Expose()
  @ApiPropertyOptional({ ...UserFields.department, type: DepartmentResponseDto })
  @Type(() => DepartmentResponseDto)
  department: DepartmentResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ ...UserFields.position, type: PositionResponseDto })
  @Type(() => PositionResponseDto)
  position: PositionResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ ...UserFields.company, type: CompanyResponseDto })
  @Type(() => CompanyResponseDto)
  company: CompanyResponseDto | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.createdAt)
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional(CommonFields.updatedAt)
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional(UserFields.lastLoginAt)
  lastLoginAt: Date | null;

  @Expose()
  @ApiPropertyOptional(UserFields.fullName)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
