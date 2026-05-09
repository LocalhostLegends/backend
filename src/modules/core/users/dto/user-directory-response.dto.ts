import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserFields } from '@modules/core/users/swagger/user.fields';
import { PositionResponseDto } from '@modules/organization/positions/dto/position-response.dto';
import { DepartmentResponseDto } from '@modules/organization/departments/dto/department-response.dto';

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
  @ApiPropertyOptional(UserFields.fullName)
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
