import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@database/enums/user-status.enum';
import { DepartmentResponseDto } from '@modules/organization/departments/dto/department-response.dto';
import { PositionResponseDto } from '@modules/organization/positions/dto/position-response.dto';
import { CompanyResponseDto } from '@modules/organization/companies/dto/company-response.dto';

export class UserResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  firstName: string;

  @Expose()
  @ApiProperty()
  lastName: string;

  @Expose()
  @ApiProperty()
  email: string;

  @Expose()
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @Expose()
  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @Expose()
  @ApiPropertyOptional()
  phone: string | null;

  @Expose()
  @ApiPropertyOptional()
  avatar: string | null;

  @Expose()
  @ApiPropertyOptional({ type: DepartmentResponseDto })
  @Type(() => DepartmentResponseDto)
  department: DepartmentResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ type: PositionResponseDto })
  @Type(() => PositionResponseDto)
  position: PositionResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ type: CompanyResponseDto })
  @Type(() => CompanyResponseDto)
  company: CompanyResponseDto | null;

  @Expose()
  @ApiPropertyOptional()
  createdAt: Date;

  @Expose()
  @ApiPropertyOptional()
  updatedAt: Date;

  @Expose()
  @ApiPropertyOptional()
  lastLoginAt: Date | null;

  @Expose()
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
