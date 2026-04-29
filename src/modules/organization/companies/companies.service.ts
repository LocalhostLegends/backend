import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Company } from '@database/entities/company.entity';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompaniesErrors } from './companies.errors';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly _companyRepository: Repository<Company>,
    private readonly _permissions: PermissionsService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, currentUser?: AuthorizedUser): Promise<Company> {
    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE);
    }

    // Check if subdomain is unique
    if (createCompanyDto.subdomain) {
      await this._ensureSubdomainUnique(createCompanyDto.subdomain);
    }

    const company = this._companyRepository.create(createCompanyDto);
    return this._companyRepository.save(company);
  }

  async findAll(currentUser?: AuthorizedUser): Promise<Company[]> {
    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_READ);
    }

    return this._companyRepository.find({
      relations: ['users', 'departments', 'positions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findById(id: string, currentUser?: AuthorizedUser): Promise<Company> {
    const company = await this._companyRepository.findOne({
      where: { id },
      relations: ['users', 'departments', 'positions'],
    });

    if (!company) {
      throw new NotFoundException(CompaniesErrors.companyWithIdNotFound(id));
    }

    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_READ, company);
    }

    return company;
  }

  async findBySubdomain(subdomain: string): Promise<Company | null> {
    return this._companyRepository.findOne({
      where: { subdomain },
    });
  }

  async update(
    id: string,
    updateCompanyDto: UpdateCompanyDto,
    currentUser?: AuthorizedUser,
  ): Promise<Company> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE, company);
    }

    // Check subdomain uniqueness if it's being updated
    if (updateCompanyDto.subdomain && updateCompanyDto.subdomain !== company.subdomain) {
      await this._ensureSubdomainUnique(updateCompanyDto.subdomain);
    }

    Object.assign(company, updateCompanyDto);
    return this._companyRepository.save(company);
  }

  async remove(id: string, currentUser?: AuthorizedUser): Promise<void> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_DELETE, company);
    }

    await this._companyRepository.softDelete(company.id);
  }

  async incrementEmployeeCount(id: string): Promise<void> {
    await this._companyRepository.increment({ id }, 'employeeCount', 1);
  }

  async decrementEmployeeCount(id: string): Promise<void> {
    await this._companyRepository.decrement({ id }, 'employeeCount', 1);
  }

  async updateSubscription(
    id: string,
    plan: string,
    expiresAt: Date,
    currentUser?: AuthorizedUser,
  ): Promise<Company> {
    const company = await this.findById(id, currentUser);

    if (currentUser) {
      this._permissions.assertCan(currentUser, PermissionAction.COMPANY_UPDATE, company);
    }

    company.subscriptionPlan = plan;
    company.subscriptionExpiresAt = expiresAt;
    return this._companyRepository.save(company);
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
      throw new ConflictException(`Subdomain "${subdomain}" is already taken`);
    }
  }
}
