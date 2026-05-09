import { Company } from '@database/entities/company.entity';
import { transformToDto } from '@common/utils/dto.utils';
import { CompanyResponseDto } from './dto/company-response.dto';
import { AddressType } from '@common/enums/address-type.enum';

/**
 * Utility for mapping a Company entity to a CompanyResponseDto.
 */
export function toCompanyResponse(company: Company): CompanyResponseDto;
export function toCompanyResponse(companies: Company[]): CompanyResponseDto[];
export function toCompanyResponse(
  data: Company | Company[],
): CompanyResponseDto | CompanyResponseDto[] {
  const mapSingle = (company: Company) => {
    const legalAddress = company.addresses?.find((a) => a.type === AddressType.LEGAL);

    return {
      id: company.id,
      name: company.name,
      subdomain: company.subdomain,
      logoUrl: company.logoUrl,
      timezone: company.timezone,
      isActive: company.isActive,
      subscriptionPlan: company.subscriptionPlan,
      subscriptionExpiresAt: company.subscriptionExpiresAt,
      // From profile
      taxId: company.profile?.taxId || null,
      registrationNumber: company.profile?.registrationNumber || null,
      industry: company.profile?.industry || null,
      companySize: company.profile?.companySize || null,
      phone: company.profile?.phone || null,
      email: company.profile?.email || null,
      website: company.profile?.website || null,
      employeeCount: company.profile?.employeeCount || 0,
      // From addresses
      country: legalAddress?.country || null,
      city: legalAddress?.city || null,
      address: legalAddress?.street || null,
      postalCode: legalAddress?.postalCode || null,
    };
  };

  if (Array.isArray(data)) {
    return transformToDto(CompanyResponseDto, data.map(mapSingle));
  }

  return transformToDto(CompanyResponseDto, mapSingle(data));
}
