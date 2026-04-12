import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { companyData } from './data/company.data';
import { departmentsData } from './data/departments.data';
import { positionsData } from './data/positions.data';
import { DEFAULT_SEED_PASSWORD, usersData } from './data/users.data';

import { Company } from '../entities/company.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { User } from '../entities/user.entity';
import { UserStatus } from '../enums/user-status.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Company)
    private readonly _companyRepository: Repository<Company>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV === 'production') {
      return;
    }

    try {
      await this.seed();
    } catch (error) {
      this.logger.error('Seeding failed', error instanceof Error ? error.stack : String(error));
    }
  }

  async seed(): Promise<void> {
    const hasCompanies = await this._companyRepository.count();

    if (hasCompanies > 0) {
      this.logger.log('Database already seeded, skipping');
      return;
    }

    this.logger.log('Starting database seed');

    await this._dataSource.transaction(async (manager) => {
      const companyRepository = manager.getRepository(Company);
      const departmentRepository = manager.getRepository(Department);
      const positionRepository = manager.getRepository(Position);
      const userRepository = manager.getRepository(User);

      const now = new Date();
      const subscriptionExpiresAt = this._addDays(now, companyData.subscriptionExpiresInDays);

      const company = await companyRepository.save(
        companyRepository.create({
          name: companyData.name,
          subdomain: companyData.subdomain,
          logoUrl: companyData.logoUrl,
          timezone: companyData.timezone,
          isActive: companyData.isActive,
          subscriptionPlan: companyData.subscriptionPlan,
          subscriptionExpiresAt,
          settings: {
            ...companyData.settings,
            employeeCount: usersData.length,
          },
        }),
      );
      this.logger.log(`Created company: ${company.name}`);

      const departmentsByKey = new Map<string, Department>();
      for (const departmentData of departmentsData) {
        const department = await departmentRepository.save(
          departmentRepository.create({
            name: departmentData.name,
            description: departmentData.description,
            code: departmentData.code,
            budget: departmentData.budget,
            isActive: departmentData.isActive,
            company,
          }),
        );

        departmentsByKey.set(departmentData.key, department);
      }
      this.logger.log(`Created ${departmentsByKey.size} departments`);

      const positionsByKey = new Map<string, Position>();
      for (const positionData of positionsData) {
        const position = await positionRepository.save(
          positionRepository.create({
            title: positionData.title,
            description: positionData.description,
            code: positionData.code,
            minSalary: positionData.minSalary,
            maxSalary: positionData.maxSalary,
            gradeLevel: positionData.gradeLevel,
            isActive: positionData.isActive,
            company,
          }),
        );

        positionsByKey.set(positionData.key, position);
      }
      this.logger.log(`Created ${positionsByKey.size} positions`);

      const hashedPassword = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);
      const usersByKey = new Map<string, User>();

      for (const userData of usersData) {
        const department = userData.departmentKey
          ? this._getFromMap(departmentsByKey, userData.departmentKey, 'department')
          : null;
        const position = userData.positionKey
          ? this._getFromMap(positionsByKey, userData.positionKey, 'position')
          : null;
        const createdBy = userData.createdByKey
          ? this._getFromMap(usersByKey, userData.createdByKey, 'user')
          : null;
        const updatedBy = userData.updatedByKey
          ? this._getFromMap(usersByKey, userData.updatedByKey, 'user')
          : createdBy;
        const hasPassword = userData.status !== UserStatus.INVITED;

        const user = await userRepository.save(
          userRepository.create({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            password: hasPassword ? hashedPassword : null,
            role: userData.role,
            status: userData.status,
            company,
            department,
            position,
            phone: userData.phone ?? null,
            avatar: userData.avatar ?? null,
            lastLoginAt: userData.status === UserStatus.ACTIVE ? now : null,
            lastLoginIp: userData.lastLoginIp ?? null,
            failedLoginAttempts: userData.failedLoginAttempts ?? 0,
            lockedUntil:
              userData.status === UserStatus.BLOCKED
                ? this._addHours(now, userData.lockedForHours ?? 12)
                : null,
            emailVerifiedAt: hasPassword ? now : null,
            metadata: {
              invitedBy: createdBy?.id,
              invitedAt: now,
              source: userData.source,
              welcomeEmailSent: hasPassword,
              lastPasswordChange: hasPassword ? now : undefined,
            },
            preferences: {
              language: userData.preferences?.language ?? 'en',
              timezone: userData.preferences?.timezone ?? company.timezone,
              notifications: {
                email: true,
                push: true,
                sms: false,
                ...userData.preferences?.notifications,
              },
              theme: userData.preferences?.theme ?? 'system',
            },
            createdBy: createdBy?.id ?? null,
            updatedBy: updatedBy?.id ?? null,
          }),
        );

        usersByKey.set(userData.key, user);
      }
      this.logger.log(`Created ${usersByKey.size} users`);

      for (const departmentData of departmentsData) {
        const department = this._getFromMap(departmentsByKey, departmentData.key, 'department');
        const parentDepartment = departmentData.parentDepartmentKey
          ? this._getFromMap(departmentsByKey, departmentData.parentDepartmentKey, 'department')
          : null;
        const managerUser = departmentData.managerKey
          ? this._getFromMap(usersByKey, departmentData.managerKey, 'user')
          : null;

        department.parentDepartment = parentDepartment;
        department.manager = managerUser;

        await departmentRepository.save(department);
      }
      this.logger.log('Updated department managers and hierarchy');
    });

    this.logger.log('Database seed completed');
    this.logger.log(`Seeded user password: ${DEFAULT_SEED_PASSWORD}`);
  }

  private _getFromMap<T>(items: Map<string, T>, key: string, entityName: string): T {
    const item = items.get(key);

    if (!item) {
      throw new Error(`Seed ${entityName} with key "${key}" was not found`);
    }

    return item;
  }

  private _addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
  }

  private _addHours(date: Date, hours: number): Date {
    return new Date(date.getTime() + hours * 60 * 60 * 1000);
  }
}
