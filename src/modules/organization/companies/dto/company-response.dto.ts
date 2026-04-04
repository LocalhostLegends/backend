import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CompanyResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiPropertyOptional()
  subdomain: string | null;

  @Expose()
  @ApiPropertyOptional()
  logoUrl: string | null;

  @Expose()
  @ApiProperty()
  timezone: string;

  @Expose()
  @ApiPropertyOptional()
  country: string | null;

  @Expose()
  @ApiPropertyOptional()
  city: string | null;

  @Expose()
  @ApiPropertyOptional()
  address: string | null;

  @Expose()
  @ApiPropertyOptional()
  phone: string | null;

  @Expose()
  @ApiPropertyOptional()
  email: string | null;

  @Expose()
  @ApiPropertyOptional()
  website: string | null;

  @Expose()
  @ApiPropertyOptional()
  taxId: string | null;

  @Expose()
  @ApiProperty()
  employeeCount: number;

  @Expose()
  @ApiProperty()
  isActive: boolean;

  @Expose()
  @ApiProperty()
  subscriptionPlan: string;

  @Expose()
  @ApiPropertyOptional()
  subscriptionExpiresAt: Date | null;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}