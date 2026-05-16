import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePayrollPeriodDto {
  @ApiProperty({ example: 'May 2026' })
  @IsString()
  name: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdatePayrollStatusDto {
  @ApiProperty({ example: 'OPEN' })
  @IsString()
  status: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}
