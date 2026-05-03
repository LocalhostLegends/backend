import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { CommonFields } from '@common/swagger/common.fields';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';

export class CompanyResponseDto {
  @Expose()
  @ApiProperty(CompanyFields.id)
  id: string;

  @Expose()
  @ApiProperty(CompanyFields.name)
  name: string;

  @Expose()
  @ApiPropertyOptional(CompanyFields.subdomain)
  subdomain: string | null;

  @Expose()
  @ApiPropertyOptional(CompanyFields.logoUrl)
  logoUrl: string | null;

  @Expose()
  @ApiProperty(CommonFields.timezone)
  timezone: string;

  @Expose()
  @ApiPropertyOptional(CommonFields.country)
  country: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.city)
  city: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.address)
  address: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.phone)
  phone: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.email)
  email: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.website)
  website: string | null;

  @Expose()
  @ApiPropertyOptional(CommonFields.taxId)
  taxId: string | null;

  @Expose()
  @ApiProperty(CompanyFields.employeeCount)
  employeeCount: number;

  @Expose()
  @ApiProperty(CompanyFields.isActive)
  isActive: boolean;

  @Expose()
  @ApiProperty(CompanyFields.subscriptionPlan)
  subscriptionPlan: string;

  @Expose()
  @ApiPropertyOptional(CompanyFields.subscriptionExpiresAt)
  subscriptionExpiresAt: Date | null;
}
