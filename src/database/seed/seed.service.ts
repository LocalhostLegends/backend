import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

import config from '@config/app.config';
import { UserStatus } from '@common/enums/user-status.enum';
import { UserRole } from '@common/enums/user-role.enum';

import { companyData } from './data/company.data';
import { departmentsData } from './data/departments.data';
import { positionsData } from './data/positions.data';
import { DEFAULT_SEED_PASSWORD, usersData } from './data/users.data';

import { Company } from '../entities/company.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { StorageService } from '../../modules/storage/storage.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly _dataSource: DataSource,
    @InjectRepository(Company)
    private readonly _companyRepository: Repository<Company>,
    private readonly _storageService: StorageService,
  ) {}

  async onModuleInit(): Promise<void> {
    if (config.isProduction) {
      return;
    }

    try {
      await this.seed();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error('Seeding failed', stack || message);
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
      const roleRepository = manager.getRepository(Role);

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
      this.logger.log(`✅ Created company: ${company.name}`);

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
      this.logger.log(`✅ Created ${departmentsByKey.size} departments`);

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
      this.logger.log(`✅ Created ${positionsByKey.size} positions`);

      const roles = await roleRepository.find({ where: { isSystem: true } });
      const rolesMap = new Map(roles.map((r) => [r.code, r]));
      this.logger.log(`✅ Loaded ${roles.length} roles`);

      const hashedPassword = await bcrypt.hash(DEFAULT_SEED_PASSWORD, 10);
      const usersByKey = new Map<string, User>();

      for (const userData of usersData) {
        const department = userData.departmentKey
          ? this._getFromMap(departmentsByKey, userData.departmentKey, 'department')
          : null;
        const position = userData.positionKey
          ? this._getFromMap(positionsByKey, userData.positionKey, 'position')
          : null;

        const hasPassword = userData.status !== UserStatus.INVITED;

        const dateOfBirth = userData.dateOfBirth
          ? new Date(userData.dateOfBirth)
          : this._getRandomDate(1960, 2007);

        const hireDate = userData.hireDate
          ? new Date(userData.hireDate)
          : this._getRandomDate(2020, 2025);

        if (hireDate > now) {
          hireDate.setTime(now.getTime() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30));
        }

        const createdAt = this._getRandomDateAround(hireDate, 7);
        const updatedAt = this._getRandomDateAround(now, 2);

        let avatarUrl = null;
        if (userData.avatar) {
          try {
            const possiblePaths = [
              path.join(__dirname, 'data', 'photo', userData.avatar),
              path.join(process.cwd(), 'src', 'database', 'seed', 'data', 'photo', userData.avatar),
              path.join(process.cwd(), 'database', 'seed', 'data', 'photo', userData.avatar),
            ];

            let photoPath = possiblePaths[0];
            for (const p of possiblePaths) {
              if (fs.existsSync(p)) {
                photoPath = p;
                break;
              }
            }

            if (fs.existsSync(photoPath)) {
              const fileBuffer = fs.readFileSync(photoPath);
              const ext = path.extname(userData.avatar).substring(1);
              const file = {
                buffer: fileBuffer,
                originalname: userData.avatar,
                mimetype: `image/${ext === 'webp' ? 'webp' : 'jpeg'}`,
              } as Express.Multer.File;
              const uploadResult = await this._storageService.uploadAvatar(
                file,
                company.id,
                userData.email,
              );
              avatarUrl = uploadResult.url;
            } else {
              this.logger.warn(`Photo not found for ${userData.email}: ${userData.avatar}`);
            }
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            this.logger.warn(`Failed to upload avatar for ${userData.email}: ${message}`);
          }
        }

        const roleCodes = [...userData.roles];
        const isManager = departmentsData.some((d) => d.managerKey === userData.key);
        if (isManager && !roleCodes.includes(UserRole.MANAGER)) {
          roleCodes.push(UserRole.MANAGER);
        }

        if (roleCodes.length === 0) {
          roleCodes.push(UserRole.EMPLOYEE);
        }

        const roleEntities = roleCodes
          .map((code) => rolesMap.get(code))
          .filter((r): r is Role => !!r);

        if (roleEntities.length === 0) {
          this.logger.warn(`No roles found for ${userData.email}`);
        }

        const user = userRepository.create({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: hasPassword ? hashedPassword : null,
          dateOfBirth,
          hireDate,
          status: userData.status,
          company,
          department,
          position,
          phone: userData.phone ?? null,
          avatar: avatarUrl,
          lastLoginAt: userData.status === UserStatus.ACTIVE ? now : null,
          lastLoginIp: userData.lastLoginIp ?? null,
          failedLoginAttempts: userData.failedLoginAttempts ?? 0,
          lockedUntil:
            userData.status === UserStatus.BLOCKED
              ? this._addHours(now, userData.lockedForHours ?? 12)
              : null,
          emailVerifiedAt: hasPassword ? now : null,
          createdAt,
          updatedAt,
          metadata: {
            invitedAt: hireDate,
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
        });

        const savedUser = await userRepository.save(user);

        if (roleEntities.length > 0) {
          savedUser.roles = roleEntities;
          await userRepository.save(savedUser);
        }

        usersByKey.set(userData.key, savedUser);
      }
      this.logger.log(`✅ Created ${usersByKey.size} users`);

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
      this.logger.log('✅ Updated department managers and hierarchy');
    });

    this.logger.log('Database seed completed');
    this.logger.log(`Default password for all users: ${DEFAULT_SEED_PASSWORD}`);
  }

  private _getFromMap<T>(items: Map<string, T>, key: string, entityName: string): T {
    const item = items.get(key);
    if (!item) {
      throw new Error(`Seed ${entityName} with key "${key}" was not found`);
    }
    return item;
  }

  private _addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private _addHours(date: Date, hours: number): Date {
    const result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result;
  }

  private _getRandomDate(startYear: number, endYear: number): Date {
    const year = Math.floor(Math.random() * (endYear - startYear + 1)) + startYear;
    const month = Math.floor(Math.random() * 12);
    const day = Math.floor(Math.random() * 28) + 1;
    return new Date(year, month, day);
  }

  private _getRandomDateAround(baseDate: Date, daysRange: number): Date {
    const offset = Math.floor(Math.random() * daysRange * 2) - daysRange;
    const date = new Date(baseDate);
    date.setDate(date.getDate() + offset);
    return date;
  }
}
