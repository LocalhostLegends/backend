import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

import config from '@config/app.config';
import { UserStatus } from '@common/enums/user-status.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { LeaveStatus } from '@common/enums/leave-status.enum';
import { ParticipantStatus } from '@common/enums/participant-status.enum';
import { ApplicationStage } from '@common/enums/application-stage.enum';
import { OnboardingStatus } from '@common/enums/onboarding-status.enum';
import { BonusStatus } from '@common/enums/bonus-status.enum';
import { PayrollPeriodStatus } from '@common/enums/payroll-period-status.enum';
import { PayrollRecordStatus } from '@common/enums/payroll-record-status.enum';

import { companyData } from './data/company.data';
import { departmentsData } from './data/departments.data';
import { positionsData } from './data/positions.data';
import { DEFAULT_SEED_PASSWORD, usersData } from './data/users.data';
import { onboardingTemplatesData } from './data/onboarding-templates.data';
import { leaveTypesData, leaveRequestsSeedData } from './data/leave.data';
import { tasksData } from './data/tasks.data';
import { calendarEventsData } from './data/calendar.data';
import { recruitmentData } from './data/recruitment.data';
import { salariesData, bonusesData, payrollPeriodsData } from './data/payroll.data';

import { Company } from '../entities/company.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { OnboardingTemplate } from '../entities/onboarding-template.entity';
import { OnboardingTemplateStep } from '../entities/onboarding-template-step.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Task } from '../entities/task.entity';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { CalendarEventParticipant } from '../entities/calendar-event-participant.entity';
import { Job } from '../entities/job.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobApplication } from '../entities/job-application.entity';
import { OnboardingInstance } from '../entities/onboarding-instance.entity';
import { OnboardingInstanceStep } from '../entities/onboarding-instance-step.entity';
import { Salary } from '../entities/salary.entity';
import { Bonus } from '../entities/bonus.entity';
import { PayrollPeriod } from '../entities/payroll-period.entity';
import { PayrollRecord } from '../entities/payroll-record.entity';
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
      const onboardingTemplateRepository = manager.getRepository(OnboardingTemplate);
      const onboardingTemplateStepRepository = manager.getRepository(OnboardingTemplateStep);
      const leaveTypeRepository = manager.getRepository(LeaveType);
      const leaveBalanceRepository = manager.getRepository(LeaveBalance);
      const leaveRequestRepository = manager.getRepository(LeaveRequest);
      const taskRepository = manager.getRepository(Task);
      const calendarEventRepository = manager.getRepository(CalendarEvent);
      const participantRepository = manager.getRepository(CalendarEventParticipant);
      const jobRepository = manager.getRepository(Job);
      const candidateRepository = manager.getRepository(Candidate);
      const jobApplicationRepository = manager.getRepository(JobApplication);
      const onboardingInstanceRepository = manager.getRepository(OnboardingInstance);
      const onboardingInstanceStepRepository = manager.getRepository(OnboardingInstanceStep);
      const salaryRepository = manager.getRepository(Salary);
      const bonusRepository = manager.getRepository(Bonus);
      const payrollPeriodRepository = manager.getRepository(PayrollPeriod);
      const payrollRecordRepository = manager.getRepository(PayrollRecord);

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
          profile: {
            email: companyData.settings.email,
            phone: companyData.settings.phone,
            website: companyData.settings.website,
            taxId: companyData.settings.taxId,
            registrationNumber: companyData.settings.registrationNumber,
            industry: companyData.settings.industry,
            companySize: companyData.settings.companySize,
            employeeCount: usersData.length,
          },
        }),
      );
      this.logger.log(`✅ Created company: ${company.name}`);

      // --- ONBOARDING TEMPLATES SEEDING ---
      const onboardingTemplatesMap = new Map<string, OnboardingTemplate>();
      for (const templateData of onboardingTemplatesData) {
        const template = await onboardingTemplateRepository.save(
          onboardingTemplateRepository.create({
            name: templateData.name,
            description: templateData.description,
            companyId: company.id,
          }),
        );

        const steps = [];
        for (const stepData of templateData.steps) {
          const step = await onboardingTemplateStepRepository.save(
            onboardingTemplateStepRepository.create({
              ...stepData,
              templateId: template.id,
            }),
          );
          steps.push(step);
        }
        template.steps = steps;
        onboardingTemplatesMap.set(template.name, template);
      }
      this.logger.log(`✅ Created ${onboardingTemplatesData.length} onboarding templates`);

      const departmentsByKey = new Map<string, Department>();
      for (const departmentData of departmentsData) {
        const department = await departmentRepository.save(
          departmentRepository.create({
            name: departmentData.name,
            description: departmentData.description,
            code: departmentData.code,
            budget: departmentData.budget,
            isActive: departmentData.isActive,
            company: company,
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
            company: company,
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

      this.logger.log('⏳ Checking and processing avatars, please wait...');

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
              const uploadResult = await this._storageService.uploadSeedAvatar(
                file,
                userData.avatar,
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
          dateOfBirth,
          hireDate,
          status: userData.status,
          company: company,
          department,
          position,
          roles: roleEntities,
          phone: userData.phone ?? null,
          avatar: avatarUrl,
          createdAt,
          updatedAt,
          security: {
            password: hasPassword ? hashedPassword : null,
            lastLoginAt: userData.status === UserStatus.ACTIVE ? now : null,
            lastLoginIp: userData.lastLoginIp ?? null,
            failedLoginAttempts: userData.failedLoginAttempts ?? 0,
            lockedUntil:
              userData.status === UserStatus.BLOCKED
                ? this._addHours(now, userData.lockedForHours ?? 12)
                : null,
            emailVerifiedAt: hasPassword ? now : null,
          },
          settings: {
            language: userData.preferences?.language ?? 'en',
            timezone: userData.preferences?.timezone ?? company.timezone,
            notifications: {
              email: true,
              push: true,
              sms: false,
              ...userData.preferences?.notifications,
            },
            theme: userData.preferences?.theme ?? 'system',
            metadata: {
              invitedAt: hireDate,
              source: userData.source,
              welcomeEmailSent: hasPassword,
              lastPasswordChange: hasPassword ? now : undefined,
            },
          },
        });

        const savedUser = await userRepository.save(user);
        usersByKey.set(userData.key, savedUser);
      }
      this.logger.log(`✅ Created ${usersByKey.size} users`);

      // --- USER MANAGERS HIERARCHY SEEDING ---
      for (const userData of usersData) {
        if (userData.managerKey) {
          const user = usersByKey.get(userData.key);
          const manager = usersByKey.get(userData.managerKey);
          if (user && manager) {
            user.manager = manager;
            user.managerId = manager.id;
            await userRepository.save(user);
          }
        }
      }
      this.logger.log('✅ Updated user managers hierarchy');

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

      // --- LEAVE TYPES SEEDING ---
      const leaveTypesMap = new Map<string, LeaveType>();
      for (const ltData of leaveTypesData) {
        const leaveType = await leaveTypeRepository.save(
          leaveTypeRepository.create({
            ...ltData,
            company,
          }),
        );
        leaveTypesMap.set(ltData.code, leaveType);
      }
      this.logger.log(`✅ Created ${leaveTypesMap.size} leave types`);

      // --- LEAVE BALANCES SEEDING ---
      for (const user of usersByKey.values()) {
        for (const leaveType of leaveTypesMap.values()) {
          if (leaveType.requiresBalance) {
            await leaveBalanceRepository.save(
              leaveBalanceRepository.create({
                employee: user,
                leaveType: leaveType,
                totalDays: leaveType.defaultDays,
                usedDays: 0,
                remainingDays: leaveType.defaultDays,
              }),
            );
          }
        }
      }
      this.logger.log('✅ Created leave balances for all users');

      // --- LEAVE REQUESTS SEEDING ---
      for (const lrData of leaveRequestsSeedData) {
        const user = usersByKey.get(lrData.userKey);
        const leaveType = leaveTypesMap.get(lrData.leaveTypeCode);
        if (user && leaveType) {
          const startDate = this._addDays(now, lrData.startDateOffset);
          const endDate = this._addDays(now, lrData.endDateOffset);

          await leaveRequestRepository.save(
            leaveRequestRepository.create({
              employee: user,
              leaveType: leaveType,
              company: company,
              startDate,
              endDate,
              totalDays: this._calculateDays(startDate, endDate),
              status: lrData.status,
              reason: lrData.reason,
              approvedAt: lrData.status === LeaveStatus.APPROVED ? now : null,
            }),
          );
        }
      }
      this.logger.log(`✅ Created ${leaveRequestsSeedData.length} leave requests`);

      // --- TASKS SEEDING ---
      const engineeringDept = departmentsByKey.get('engineering');
      if (engineeringDept) {
        const defaultCreator = usersByKey.get('eng-lead') || Array.from(usersByKey.values())[0];

        if (defaultCreator) {
          for (let i = 0; i < tasksData.length; i++) {
            const tData = tasksData[i];
            const assignee = tData.assigneeKey ? usersByKey.get(tData.assigneeKey) || null : null;

            await taskRepository.save(
              taskRepository.create({
                ...tData,
                key: `ENG-${i + 1}`,
                company: company,
                department: engineeringDept,
                creator: defaultCreator,
                assignee: assignee,
                order: i,
              }),
            );
          }
          this.logger.log(`✅ Created ${tasksData.length} tasks for Engineering`);
        }
      }

      // --- CALENDAR EVENTS SEEDING ---
      for (const ceData of calendarEventsData) {
        const organizer = usersByKey.get(ceData.userKeys[0]) || Array.from(usersByKey.values())[0];
        if (organizer) {
          const startTime = new Date(now);
          startTime.setDate(startTime.getDate() + ceData.dayOffset);
          startTime.setHours(ceData.startHour, 0, 0, 0);

          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + ceData.durationMinutes);

          const event = await calendarEventRepository.save(
            calendarEventRepository.create({
              title: ceData.title,
              description: ceData.description,
              type: ceData.type,
              startTime,
              endTime,
              company,
              organizer,
              attendees: ceData.userKeys.length,
            }),
          );

          for (const userKey of ceData.userKeys) {
            const user = usersByKey.get(userKey);
            if (user) {
              await participantRepository.save(
                participantRepository.create({
                  event,
                  user,
                  status: ParticipantStatus.ACCEPTED,
                }),
              );
            }
          }
        }
      }
      this.logger.log(`✅ Created ${calendarEventsData.length} calendar events`);

      // --- RECRUITMENT SEEDING ---
      const engineeringPosition =
        positionsByKey.get('be-engineer') || Array.from(positionsByKey.values())[0];
      const adminUser = Array.from(usersByKey.values())[0];

      for (const vData of recruitmentData.vacancies) {
        const dept = departmentsByKey.get(vData.departmentKey);
        const job = await jobRepository.save(
          jobRepository.create({
            title: vData.title,
            description: vData.description,
            status: vData.status,
            type: vData.type,
            company,
            department: dept,
            creator: adminUser,
          }),
        );

        for (let i = 0; i < vData.applications.length; i++) {
          const appData = vData.applications[i];
          const [firstName, ...lastNameParts] = appData.name.split(' ');
          const lastName = lastNameParts.join(' ');

          const candidate = await candidateRepository.save(
            candidateRepository.create({
              firstName,
              lastName,
              email: appData.email,
              company,
            }),
          );

          await jobApplicationRepository.save(
            jobApplicationRepository.create({
              job,
              candidate,
              stage: appData.stage,
              order: i,
            }),
          );

          // If hired, create User and Onboarding
          if (appData.stage === ApplicationStage.HIRED) {
            const hiredUser = await userRepository.save(
              userRepository.create({
                firstName,
                lastName,
                email: appData.email,
                status: UserStatus.ACTIVE,
                company,
                department: dept,
                position: engineeringPosition,
                hireDate: now,
                roles: [rolesMap.get(UserRole.EMPLOYEE)!],
                security: {
                  password: hashedPassword,
                  emailVerifiedAt: now,
                },
                settings: {
                  language: 'en',
                  timezone: company.timezone,
                  theme: 'system',
                },
              }),
            );

            // Create Onboarding Instance
            const template =
              onboardingTemplatesMap.get('Software Engineer Onboarding') ||
              onboardingTemplatesMap.get('Standard Employee Onboarding');
            if (template) {
              const instance = await onboardingInstanceRepository.save(
                onboardingInstanceRepository.create({
                  employee: hiredUser,
                  template,
                  company,
                  status: OnboardingStatus.IN_PROGRESS,
                  startedAt: now,
                }),
              );

              // Partially complete steps (e.g., first 2-3 steps)
              const stepsToComplete = Math.floor(Math.random() * 2) + 2; // 2 or 3
              for (let j = 0; j < template.steps.length; j++) {
                const tStep = template.steps[j];
                const isCompleted = j < stepsToComplete;

                await onboardingInstanceStepRepository.save(
                  onboardingInstanceStepRepository.create({
                    instance,
                    templateStep: tStep,
                    status: isCompleted ? OnboardingStatus.COMPLETED : OnboardingStatus.PENDING,
                    completedAt: isCompleted ? now : null,
                  }),
                );
              }

              // Update progress
              instance.progress = Math.round((stepsToComplete / template.steps.length) * 100);
              await onboardingInstanceRepository.save(instance);
            }
          }
        }
      }
      this.logger.log(`✅ Created recruitment data and onboarding instances`);

      // --- PAYROLL SEEDING ---
      // Salaries
      for (const sData of salariesData) {
        const user = usersByKey.get(sData.userKey);
        if (user) {
          await salaryRepository.save(
            salaryRepository.create({
              user,
              company,
              amount: sData.amount,
              currency: sData.currency,
              payFrequency: sData.payFrequency,
              effectiveDate: user.hireDate,
            }),
          );
        }
      }
      this.logger.log(`✅ Created ${salariesData.length} salaries`);

      // Bonuses
      const savedBonusesByEntry = new Map<any, Bonus>();
      for (const bData of bonusesData) {
        const user = usersByKey.get(bData.userKey);
        if (user) {
          const bonus = await bonusRepository.save(
            bonusRepository.create({
              user,
              company,
              amount: bData.amount,
              currency: 'USD',
              type: bData.type,
              reason: bData.reason,
              status: bData.status,
              date: this._addDays(now, bData.dateOffset),
            }),
          );
          savedBonusesByEntry.set(bData, bonus);
        }
      }
      this.logger.log(`✅ Created ${bonusesData.length} bonuses`);

      // Payroll Periods and Records
      for (const ppData of payrollPeriodsData) {
        const period = await payrollPeriodRepository.save(
          payrollPeriodRepository.create({
            company,
            name: ppData.name,
            startDate: new Date(ppData.startDate),
            endDate: new Date(ppData.endDate),
            status: ppData.status,
            currency: 'USD',
          }),
        );

        // If OPEN or PAID, create records for Engineering department
        if (
          ppData.status === PayrollPeriodStatus.OPEN ||
          ppData.status === PayrollPeriodStatus.PAID
        ) {
          let periodTotal = 0;
          for (const sData of salariesData) {
            const user = usersByKey.get(sData.userKey);
            const userData = usersData.find((u) => u.key === sData.userKey);

            // Only for engineering for now as per request
            if (user && userData?.departmentKey === 'engineering') {
              const baseSalary = Number(sData.amount);

              // Get approved bonuses for this user that fall within the period
              const periodStartDate = new Date(ppData.startDate);
              const periodEndDate = new Date(ppData.endDate);

              const relevantBonuses = bonusesData.filter((bData) => {
                const bonusDate = this._addDays(now, bData.dateOffset);
                return (
                  bData.userKey === sData.userKey &&
                  bData.status === BonusStatus.APPROVED &&
                  bonusDate >= periodStartDate &&
                  bonusDate <= periodEndDate
                );
              });

              const bonusesAmount = relevantBonuses.reduce((sum, b) => sum + Number(b.amount), 0);
              const totalNet = baseSalary + bonusesAmount;
              periodTotal += totalNet;

              const record = await payrollRecordRepository.save(
                payrollRecordRepository.create({
                  payrollPeriod: period,
                  user,
                  baseSalary,
                  bonusesAmount,
                  totalNet,
                  currency: 'USD',
                  status:
                    ppData.status === PayrollPeriodStatus.PAID
                      ? PayrollRecordStatus.PAID
                      : PayrollRecordStatus.PENDING,
                }),
              );

              // Link bonuses to this record
              for (const bData of relevantBonuses) {
                const savedBonus = savedBonusesByEntry.get(bData);
                if (savedBonus) {
                  savedBonus.payrollRecordId = record.id;
                  await bonusRepository.save(savedBonus);
                }
              }
            }
          }
          period.totalAmount = periodTotal;
          await payrollPeriodRepository.save(period);
        }
      }
      this.logger.log(`✅ Created ${payrollPeriodsData.length} payroll periods and records`);
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

  private _calculateDays(start: Date, end: Date): number {
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }
}
