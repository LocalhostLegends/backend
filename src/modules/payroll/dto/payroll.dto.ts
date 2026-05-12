import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString } from 'class-validator';

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
}

export class UpdatePayrollStatusDto {
  @ApiProperty({ example: 'OPEN' })
  @IsString()
  status: string;
}
