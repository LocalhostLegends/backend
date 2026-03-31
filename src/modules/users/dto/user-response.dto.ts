import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserRole } from '@database/entities/user.entity.enums';

export class DepartmentResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() description: string;
}

export class PositionResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() title: string;
  @Expose() @ApiProperty() description: string;
}

export class UserResponseDto {
  @Expose() @ApiProperty() id: string;
  @Expose() @ApiProperty() firstName: string;
  @Expose() @ApiProperty() lastName: string;
  @Expose() @ApiProperty() email: string;
  @Expose() @ApiProperty({ enum: UserRole }) role: UserRole;
  @Expose() @ApiPropertyOptional() phone: string | null;
  @Expose() @ApiPropertyOptional() avatar: string | null;
  @Expose()
  @ApiPropertyOptional({ type: DepartmentResponseDto })
  @Type(() => DepartmentResponseDto)
  department: DepartmentResponseDto | null;
  @Expose()
  @ApiPropertyOptional({ type: PositionResponseDto })
  @Type(() => PositionResponseDto)
  position: PositionResponseDto | null;
}
