import { IsUUID, IsEnum, IsOptional, IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LeaveStatus } from '@common/enums/leave-status.enum';

export class CreateLeaveRequestDto {
  @ApiProperty({ example: 'uuid-of-leave-type' })
  @IsUUID()
  @IsNotEmpty()
  leaveTypeId: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-06-05' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiPropertyOptional({ example: 'Vacation trip' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class UpdateLeaveRequestDto {
  @ApiPropertyOptional({ example: 'uuid-of-leave-type' })
  @IsUUID()
  @IsOptional()
  leaveTypeId?: string;

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-06-05' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({ example: 'Updated reason' })
  @IsString()
  @IsOptional()
  reason?: string;
}

export class LeaveApprovalDto {
  @ApiProperty({ example: 'Approved, have a good time!' })
  @IsString()
  @IsOptional()
  comment?: string;
}

export class LeaveRejectionDto {
  @ApiProperty({ example: 'Too many people off at this time' })
  @IsString()
  @IsNotEmpty()
  comment: string;
}

export class LeaveRequestQueryDto {
  @ApiPropertyOptional({ enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  @IsOptional()
  status?: LeaveStatus;

  @ApiPropertyOptional({ example: 'uuid-of-employee' })
  @IsUUID()
  @IsOptional()
  employeeId?: string;
}
