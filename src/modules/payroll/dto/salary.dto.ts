import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';
import { SalaryPayFrequency } from '@common/enums/salary-pay-frequency.enum';

export class UpdateSalaryDto {
  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ enum: SalaryPayFrequency })
  @IsEnum(SalaryPayFrequency)
  payFrequency: SalaryPayFrequency;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  effectiveDate: string;

  @ApiPropertyOptional({ example: 'Annual performance review' })
  @IsString()
  @IsOptional()
  reason?: string;
}
