import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { SalaryRevisionStatus } from '@common/enums/salary-revision-status.enum';

export class CreateSalaryRevisionRequestDto {
  @ApiProperty({ example: 5500 })
  @IsNumber()
  requestedAmount: number;

  @ApiProperty({ example: 'Increased responsibilities and successful project delivery.' })
  @IsString()
  @MinLength(10)
  reason: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}

export class ReviewSalaryRevisionRequestDto {
  @ApiProperty({ enum: SalaryRevisionStatus, example: SalaryRevisionStatus.APPROVED })
  @IsEnum(SalaryRevisionStatus)
  status: SalaryRevisionStatus;

  @ApiPropertyOptional({ example: 'Approved based on performance review.' })
  @IsString()
  @IsOptional()
  reviewNote?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}
