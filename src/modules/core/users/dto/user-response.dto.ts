import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@/common/enums/user-status.enum';
import { CommonFields } from '@common/swagger/common.fields';
import { DepartmentResponseDto } from '@modules/organization/departments/dto/department-response.dto';
import { PositionResponseDto } from '@modules/organization/positions/dto/position-response.dto';
import { CompanyResponseDto } from '@modules/organization/companies/dto/company-response.dto';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';

export class UserManagerResponseDto {
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
  @ApiPropertyOptional(UserFields.avatar)
  avatar: string | null;
}

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
  @ApiProperty({ ...UserFields.roles, isArray: true, type: String })
  roles: UserRole[];

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
  @ApiProperty({ description: 'Company ID', format: 'uuid' })
  get companyId(): string | null {
    return this.company?.id || null;
  }

  @Expose()
  @ApiPropertyOptional({ description: 'Manager details', type: UserManagerResponseDto })
  @Type(() => UserManagerResponseDto)
  manager: UserManagerResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Manager ID', format: 'uuid' })
  managerId: string | null;

  @Expose()
  @ApiProperty({ description: 'User permissions', isArray: true, type: String })
  permissions: string[];

  @Expose()
  @ApiPropertyOptional(UserFields.lastLoginAt)
  lastLoginAt: Date | null;

  @Expose()
  @ApiPropertyOptional(UserFields.dateOfBirth)
  dateOfBirth: Date | null;

  @Expose()
  @ApiProperty(UserFields.hireDate)
  hireDate: Date;

  @Expose()
  @ApiPropertyOptional({ description: 'User fullName' })
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  @Expose()
  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  customFields?: Record<string, CustomFieldValueType>;
}
