import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class QueryEventDto {
  @ApiPropertyOptional({ example: '2024-05-01T00:00:00Z' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiPropertyOptional({ example: '2024-05-31T23:59:59Z' })
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
