import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { Company } from '@database/entities/company.entity';
import { CompanyProfile } from '@database/entities/company-profile.entity';
import { AddressType } from '@common/enums/address-type.enum';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Address } from '@/database/entities/address.entity';

export type CompanyWithCustomFields = Company & { customFields: CustomFieldsMap };

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly _companyRepository: Repository<Company>,
    private readonly _permissions: PermissionsService,
    private readonly _customFieldsService: CustomFieldsService,
  ) {}

  async create(
    createCompanyDto: CreateCompanyDto,
    currentUser?: AuthorizedUser,
  ): Promise<CompanyWithCustomFields> {
    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE);
    }

    // Check if subdomain is unique
    if (createCompanyDto.subdomain) {
      await this._ensureSubdomainUnique(createCompanyDto.subdomain);
    }

    const {
      country,
      city,
      address: street,
      postalCode,
      taxId,
      registrationNumber,
      industry,
      employeeCount,
      companySize,
      phone,
      email,
      website,
      ...companyData
    } = createCompanyDto;

    const company = this._companyRepository.create({
      ...companyData,
      profile: {
        taxId,
        registrationNumber,
        industry,
        employeeCount,
        companySize,
        phone,
        email,
        website,
      },
      addresses:
        country || city || street || postalCode
          ? [
              {
                country: country || 'Unknown',
                city: city || 'Unknown',
                street: street || 'Unknown',
                postalCode: postalCode || null,
                type: AddressType.LEGAL,
              },
            ]
          : [],
    } as DeepPartial<Company>);

    const saved = await this._companyRepository.save(company);
    return this.findById(saved.id, currentUser);
  }

  async findAll(currentUser?: AuthorizedUser): Promise<CompanyWithCustomFields[]> {
    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_READ);
    }

    const companies = await this._companyRepository.find({
      relations: ['users', 'departments', 'positions', 'profile', 'addresses'],
      order: { createdAt: 'DESC' },
    });

    if (companies.length === 0) return [];

    const companyIds = companies.map((c) => c.id);
    const allCustomFields = await this._customFieldsService.getValuesForMultipleEntities(
      currentUser?.companyId || companies[0].id,
      EntityType.COMPANY,
      companyIds,
    );

    const customFieldsMap = new Map<string, CustomFieldsMap>();
    allCustomFields.forEach((cf) => {
      let entry = customFieldsMap.get(cf.entityId);
      if (!entry) {
        entry = {};
        customFieldsMap.set(cf.entityId, entry);
      }
      entry[cf.fieldKey] = cf.value;
    });

    return companies.map((c) => ({
      ...c,
      customFields: customFieldsMap.get(c.id) || {},
    }));
  }

  async findById(id: string, currentUser?: AuthorizedUser): Promise<CompanyWithCustomFields> {
    const company = await this._companyRepository.findOne({
      where: { id },
      relations: ['users', 'departments', 'positions', 'profile', 'addresses'],
    });

    if (!company) {
      throw ExceptionFactory.companyWithIdNotFound(id);
    }

    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_READ, company);
    }

    const customFields = await this._customFieldsService.getValues(
      id, // For Company entity, its own id is the owner of definitions too (mostly)
      EntityType.COMPANY,
      id,
    );

    return {
      ...company,
      customFields,
    };
  }

  async findBySubdomain(subdomain: string): Promise<Company | null> {
    return this._companyRepository.findOne({
      where: { subdomain },
      relations: ['profile', 'addresses'],
    });
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    currentUser?: AuthorizedUser,
  ): Promise<CompanyWithCustomFields> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE, company);
    }

    // Check subdomain uniqueness if it's being updated
    if (updateCompanyDto.subdomain && updateCompanyDto.subdomain !== company.subdomain) {
      await this._ensureSubdomainUnique(updateCompanyDto.subdomain);
    }

    const {
      country,
      city,
      address: street,
      postalCode,
      taxId,
      registrationNumber,
      industry,
      employeeCount,
      companySize,
      phone,
      email,
      website,
      customFields,
      ...companyData
    } = updateCompanyDto;

    // Update main company fields
    Object.assign(company, companyData);

    // Update profile
    if (!company.profile) {
      company.profile = { company_id: company.id } as unknown as CompanyProfile;
    }
    if (taxId !== undefined) company.profile.taxId = taxId;
    if (registrationNumber !== undefined) company.profile.registrationNumber = registrationNumber;
    if (industry !== undefined) company.profile.industry = industry;
    if (employeeCount !== undefined) company.profile.employeeCount = employeeCount;
    if (companySize !== undefined) company.profile.companySize = companySize;
    if (phone !== undefined) company.profile.phone = phone;
    if (email !== undefined) company.profile.email = email;
    if (website !== undefined) company.profile.website = website;

    // Update address
    if (
      country !== undefined ||
      city !== undefined ||
      street !== undefined ||
      postalCode !== undefined
    ) {
      if (!company.addresses) company.addresses = [];
      let legalAddress = company.addresses.find((a) => a.type === AddressType.LEGAL);
      if (!legalAddress) {
        legalAddress = {
          country: country || 'Unknown',
          city: city || 'Unknown',
          street: street || 'Unknown',
          postalCode: postalCode || null,
          type: AddressType.LEGAL,
          company,
        } as unknown as Address;
        if (legalAddress) {
          company.addresses.push(legalAddress);
        }
      } else {
        if (country !== undefined) legalAddress.country = country;
        if (city !== undefined) legalAddress.city = city;
        if (street !== undefined) legalAddress.street = street;
        if (postalCode !== undefined) legalAddress.postalCode = postalCode;
      }
    }

    const saved = await this._companyRepository.save(company);

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(id, EntityType.COMPANY, id, customFields);
    }

    return this.findById(saved.id, currentUser);
  }

  async remove(id: string, currentUser?: AuthorizedUser): Promise<void> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_DELETE, company);
    }

    await this._companyRepository.softDelete(company.id);
  }

  async incrementEmployeeCount(id: string): Promise<void> {
    await this._companyRepository.manager.increment(
      CompanyProfile,
      { company_id: id },
      'employeeCount',
      1,
    );
  }

  async decrementEmployeeCount(id: string): Promise<void> {
    await this._companyRepository.manager.decrement(
      CompanyProfile,
      { company_id: id },
      'employeeCount',
      1,
    );
  }

  async updateSubscription(
    id: string,
    plan: string,
    expiresAt: Date,
    currentUser?: AuthorizedUser,
  ): Promise<CompanyWithCustomFields> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      await this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE, company);
    }

    company.subscriptionPlan = plan;
    company.subscriptionExpiresAt = expiresAt;
    const saved = await this._companyRepository.save(company);
    return this.findById(saved.id, currentUser);
  }

  async getCompanyStats(
    id: string,
    currentUser?: AuthorizedUser,
  ): Promise<{
    totalUsers: number;
    totalDepartments: number;
    totalPositions: number;
    activeUsers: number;
  }> {
    const company = await this.findById(id, currentUser);

    return {
      totalUsers: company.users?.length || 0,
      totalDepartments: company.departments?.length || 0,
      totalPositions: company.positions?.length || 0,
      activeUsers: company.users?.filter((u) => u.isActive()).length || 0,
    };
  }

  private async _ensureSubdomainUnique(subdomain: string): Promise<void> {
    const existing = await this.findBySubdomain(subdomain);
    if (existing) {
      throw ExceptionFactory.companySubdomainTaken(subdomain);
    }
  }
}
