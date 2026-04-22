import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail, IsUrl, IsBoolean } from 'class-validator';

import { CommonFields } from '@common/swagger/common.fields';
import { CompanyFields } from '@modules/organization/companies/swagger/company.fields';

export class UpdateCompanyDto {
  @ApiPropertyOptional(CompanyFields.name)
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional(CompanyFields.subdomain)
  @IsOptional()
  @IsString()
  subdomain?: string;

  @ApiPropertyOptional(CompanyFields.logoUrl)
  @IsOptional()
  @IsUrl()
  logoUrl?: string;

  @ApiPropertyOptional(CommonFields.timezone)
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional(CommonFields.country)
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional(CommonFields.city)
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional(CommonFields.address)
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional(CommonFields.phone)
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional(CommonFields.email)
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional(CommonFields.website)
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional(CommonFields.taxId)
  @IsOptional()
  @IsString()
  taxId?: string;

  @ApiPropertyOptional(CompanyFields.isActive)
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional(CompanyFields.subscriptionPlan)
  @IsOptional()
  @IsString()
  subscriptionPlan?: string;
}
