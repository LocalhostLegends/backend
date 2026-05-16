import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { PositionResponseDto } from '@modules/organization/positions/dto/position-response.dto';
import { DepartmentResponseDto } from '@modules/organization/departments/dto/department-response.dto';
import { UserManagerResponseDto } from './user-response.dto';

export class UserDirectoryResponseDto {
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

  @Expose()
  @ApiPropertyOptional({ ...UserFields.position, type: PositionResponseDto })
  @Type(() => PositionResponseDto)
  position: PositionResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ ...UserFields.department, type: DepartmentResponseDto })
  @Type(() => DepartmentResponseDto)
  department: DepartmentResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Manager details', type: UserManagerResponseDto })
  @Type(() => UserManagerResponseDto)
  manager: UserManagerResponseDto | null;

  @Expose()
  @ApiPropertyOptional({ description: 'Manager ID', format: 'uuid' })
  managerId: string | null;

  @Expose()
  @ApiPropertyOptional(UserFields.fullName)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
