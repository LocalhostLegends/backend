import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsUUID, Min } from 'class-validator';
import { BonusType } from '@common/enums/bonus-type.enum';
import { BonusStatus } from '@common/enums/bonus-status.enum';

export class CreateBonusDto {
  @ApiProperty()
  @IsUUID()
  userId: string;

  @ApiProperty({ example: 1000 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ enum: BonusType })
  @IsEnum(BonusType)
  type: BonusType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reason?: string;

  @ApiProperty({ example: '2026-05-31' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ example: '2026-05-31' })
  @IsDateString()
  @IsOptional()
  effectiveDate?: string;

  @ApiPropertyOptional({ enum: BonusStatus })
  @IsEnum(BonusStatus)
  @IsOptional()
  status?: BonusStatus;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}

export class UpdateBonusStatusDto {
  @ApiProperty({ enum: BonusStatus })
  @IsEnum(BonusStatus)
  status: BonusStatus;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsString()
  @IsOptional()
  companyId?: string;
}
