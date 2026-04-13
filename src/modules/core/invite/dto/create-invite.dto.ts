import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsUUID, IsOptional } from 'class-validator';

import { UserRole } from '@common/enums/user-role.enum';

export class CreateInviteDto {
  @ApiProperty({ example: 'hr@company.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: UserRole, example: UserRole.HR })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'uuid-of-department' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-position' })
  @IsOptional()
  @IsUUID()
  positionId?: string;
}
