import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, DeepPartial } from 'typeorm';

import { OnboardingTemplate } from '@database/entities/onboarding-template.entity';
import { OnboardingTemplateStep } from '@database/entities/onboarding-template-step.entity';
import { OnboardingInstance } from '@database/entities/onboarding-instance.entity';
import { OnboardingInstanceStep } from '@database/entities/onboarding-instance-step.entity';
import { User } from '@database/entities/user.entity';
import { Candidate } from '@database/entities/candidate.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { OnboardingStatus } from '@common/enums/onboarding-status.enum';
import { OnboardingStepType } from '@common/enums/onboarding-step-type.enum';
import { UserRole } from '@common/enums/user-role.enum';

import { TasksService } from '@modules/tasks/tasks.service';
import { EventsService } from '@modules/calendar/events/events.service';
import { TaskPriority } from '@common/enums/task-priority.enum';
import { CalendarEventType } from '@common/enums/calendar-event-type.enum';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { UsersService } from '@modules/core/users/users.service';
import { InviteService } from '@modules/core/invite/invite.service';

import {
  CreateOnboardingTemplateDto,
  HireCandidateDto,
  StartOnboardingDto,
  UpdateOnboardingTemplateDto,
} from './dto/onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingTemplate)
    private readonly _templateRepo: Repository<OnboardingTemplate>,
    @InjectRepository(OnboardingInstance)
    private readonly _instanceRepo: Repository<OnboardingInstance>,
    @InjectRepository(OnboardingInstanceStep)
    private readonly _instanceStepRepo: Repository<OnboardingInstanceStep>,
    @InjectRepository(User)
    private readonly _userRepo: Repository<User>,
    @InjectRepository(Candidate)
    private readonly _candidateRepo: Repository<Candidate>,
    private readonly _tasksService: TasksService,
    private readonly _eventsService: EventsService,
    private readonly _customFieldsService: CustomFieldsService,
    private readonly _usersService: UsersService,
    private readonly _inviteService: InviteService,
    private readonly _dataSource: DataSource,
  ) {}

  async createTemplate(
    dto: CreateOnboardingTemplateDto,
    user: AuthorizedUser,
  ): Promise<OnboardingTemplate> {
    const templateId = await this._dataSource.transaction(async (manager) => {
      const template = manager.create(OnboardingTemplate, {
        name: dto.name,
        description: dto.description,
        companyId: user.companyId,
      });

      const savedTemplate = await manager.save(template);

      if (dto.steps && dto.steps.length > 0) {
        const steps = dto.steps.map((stepDto) =>
          manager.create(OnboardingTemplateStep, {
            ...stepDto,
            templateId: savedTemplate.id,
          }),
        );
        await manager.save(steps);
      }

      return savedTemplate.id;
    });

    const result = await this._templateRepo.findOne({
      where: { id: templateId },
      relations: ['steps'],
    });

    if (!result) throw new NotFoundException('Template creation failed');
    return result;
  }

  async updateTemplate(
    id: string,
    dto: UpdateOnboardingTemplateDto,
    user: AuthorizedUser,
  ): Promise<OnboardingTemplate> {
    const template = await this._templateRepo.findOne({
      where: { id, companyId: user.companyId },
      relations: ['steps'],
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    await this._dataSource.transaction(async (manager) => {
      // Update basic fields
      if (dto.name) template.name = dto.name;
      if (dto.description !== undefined) template.description = dto.description;
      await manager.save(template);

      // Update steps if provided
      if (dto.steps) {
        const existingStepIds = template.steps.map((s) => s.id);
        const dtoStepIds = dto.steps.map((s) => s.id).filter(Boolean) as string[];

        // 1. Delete steps not in DTO
        const toDelete = existingStepIds.filter((id) => !dtoStepIds.includes(id));
        if (toDelete.length > 0) {
          await manager.delete(OnboardingTemplateStep, toDelete);
        }

        // 2. Update existing or Create new steps
        for (const stepDto of dto.steps) {
          if (stepDto.id && existingStepIds.includes(stepDto.id)) {
            // Update
            await manager.update(OnboardingTemplateStep, stepDto.id, {
              title: stepDto.title,
              description: stepDto.description,
              type: stepDto.type,
              assigneeRole: stepDto.assigneeRole,
              order: stepDto.order,
              durationDays: stepDto.durationDays,
            });
          } else {
            // Create
            const newStep = manager.create(OnboardingTemplateStep, {
              ...stepDto,
              templateId: template.id,
            } as DeepPartial<OnboardingTemplateStep>);
            await manager.save(newStep);
          }
        }
      }
    });

    const result = await this._templateRepo.findOne({
      where: { id },
      relations: ['steps'],
    });

    if (!result) throw new NotFoundException('Template not found after update');
    return result;
  }

  async getTemplates(user: AuthorizedUser): Promise<OnboardingTemplate[]> {
    return this._templateRepo.find({
      where: { companyId: user.companyId },
      relations: ['steps'],
      order: { createdAt: 'DESC' },
    });
  }

  async hireCandidate(dto: HireCandidateDto, user: AuthorizedUser): Promise<OnboardingInstance> {
    const { candidateId, templateId, departmentId, positionId, role, managerId, customFields } =
      dto;

    const candidate = await this._candidateRepo.findOne({
      where: { id: candidateId, company: { id: user.companyId } },
    });

    if (!candidate) {
      throw new NotFoundException('Candidate not found');
    }

    // 1. Create Invited User with specific role
    const newUser = await this._usersService.createInvitedUser(
      candidate.firstName,
      candidate.lastName,
      candidate.email,
      [role],
      user.companyId,
      user.id,
    );

    // 2. Set Organization Context
    newUser.department = { id: departmentId } as Department;
    newUser.position = { id: positionId } as Position;
    newUser.manager = { id: managerId } as User; // Required Manager chosen by HR
    await this._userRepo.save(newUser);

    // 3. Create Invite with specific role
    await this._inviteService.createInvite(
      {
        email: candidate.email,
        role: role,
        departmentId,
        positionId,
      },
      user,
    );

    // 4. Start Onboarding
    return this.startOnboarding(
      {
        templateId,
        employeeId: newUser.id,
        customFields,
      },
      user,
    );
  }

  async startOnboarding(
    dto: StartOnboardingDto,
    user: AuthorizedUser,
  ): Promise<OnboardingInstance> {
    const { templateId, employeeId, customFields } = dto;

    const template = await this._templateRepo.findOne({
      where: { id: templateId, companyId: user.companyId },
      relations: ['steps'],
    });

    if (!template) {
      throw new NotFoundException('Onboarding template not found');
    }

    // Load employee with full organizational context (including chosen manager and his permissions)
    const employee = await this._userRepo.findOne({
      where: { id: employeeId, company: { id: user.companyId } },
      relations: ['department', 'manager', 'manager.roles', 'manager.roles.permissions'],
    });

    if (!employee || !employee.manager) {
      throw new NotFoundException('Employee or assigned manager not found');
    }

    // Extract all unique permissions from manager roles
    const managerPermissions = new Set<string>();
    employee.manager.roles.forEach((role) => {
      role.permissions?.forEach((perm) => {
        managerPermissions.add(perm.action);
      });
    });

    // CREATE MANAGER CONTEXT: All tasks/events will be created "BY THE MANAGER"
    const managerContext: AuthorizedUser = {
      id: employee.manager.id,
      companyId: user.companyId,
      departmentId: employee.department?.id || user.departmentId,
      roles: employee.manager.roles.map((r) => r.code as UserRole),
      email: employee.manager.email,
      permissions: Array.from(managerPermissions),
      permissionsVersion: 1,
    };

    const instanceId = await this._dataSource.transaction(async (manager) => {
      // 1. Create Onboarding Instance
      const instance = manager.create(OnboardingInstance, {
        templateId: template.id,
        employeeId: employee.id,
        companyId: user.companyId,
        status: OnboardingStatus.IN_PROGRESS,
        startedAt: new Date(),
        progress: 0,
      });

      const savedInstance = await manager.save(instance);

      // 2. Save Custom Fields
      if (customFields) {
        await this._customFieldsService.setValuesWithManager(
          manager,
          user.companyId,
          EntityType.ONBOARDING_INSTANCE,
          savedInstance.id,
          customFields,
        );
      }

      // 3. Create steps: Manager creates them FOR the new hire
      for (const tStep of template.steps) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tStep.durationDays);

        const instanceStep = manager.create(OnboardingInstanceStep, {
          instanceId: savedInstance.id,
          templateStepId: tStep.id,
          status: OnboardingStatus.PENDING,
          assignedToId: employee.id, // Assigned to NEW HIRE
          dueDate,
        });

        const savedStep = await manager.save(instanceStep);

        // CREATE TASK: By Manager -> For New Hire -> In Department Scope
        if (tStep.type === OnboardingStepType.TASK) {
          const task = await this._tasksService.create(
            {
              title: `[Onboarding] ${tStep.title}`,
              description: tStep.description || '',
              priority: TaskPriority.MEDIUM,
              assigneeId: employee.id, // Task for the employee to complete
              dueDate: dueDate.toISOString(),
              departmentId: employee.department?.id,
            },
            managerContext, // Action performed on behalf of the Manager
          );
          savedStep.linkedTaskId = task.id;
          await manager.save(savedStep);
        } else if (tStep.type === OnboardingStepType.MEETING) {
          const startTime = new Date(dueDate);
          startTime.setHours(10, 0, 0, 0);
          const endTime = new Date(startTime);
          endTime.setHours(11, 0, 0, 0);

          // Update step dueDate to match meeting start time for more accurate progress tracking
          savedStep.dueDate = startTime;
          await manager.save(savedStep);

          const event = await this._eventsService.create(
            {
              title: `[Onboarding] ${tStep.title}`,
              description: tStep.description || '',
              startTime: startTime.toISOString(),
              endTime: endTime.toISOString(),
              type: CalendarEventType.MEETING,
              participantIds: [employee.id, employee.manager!.id], // New Hire and Manager meet
            },
            managerContext, // Action performed on behalf of the Manager
          );
          savedStep.linkedCalendarEventId = event.id;
          await manager.save(savedStep);
        }
      }

      return savedInstance.id;
    });

    return this.getInstance(instanceId, user);
  }

  async getInstances(user: AuthorizedUser): Promise<OnboardingInstance[]> {
    const instances = await this._instanceRepo.find({
      where: { companyId: user.companyId },
      relations: ['employee', 'template', 'steps', 'steps.templateStep'],
    });

    for (const instance of instances) {
      await this._recalculateProgressIfneeded(instance);
    }

    return instances;
  }

  async getInstance(id: string, user: AuthorizedUser): Promise<OnboardingInstance> {
    const instance = await this._instanceRepo.findOne({
      where: { id, companyId: user.companyId },
      relations: ['employee', 'template', 'steps', 'steps.templateStep'],
    });

    if (!instance) {
      throw new NotFoundException('Onboarding instance not found');
    }

    await this._recalculateProgressIfneeded(instance);

    return instance;
  }

  /**
   * Recalculates progress and updates statuses of meetings that have already passed.
   * This ensures "honest" progress even without a background cron job.
   */
  private async _recalculateProgressIfneeded(instance: OnboardingInstance): Promise<void> {
    const now = new Date();
    let hasChanges = false;

    for (const step of instance.steps) {
      // If meeting was ACCEPTED and time has passed, mark it as COMPLETED
      if (step.status === OnboardingStatus.ACCEPTED && step.dueDate && step.dueDate <= now) {
        step.status = OnboardingStatus.COMPLETED;
        step.completedAt = step.dueDate;
        await this._instanceStepRepo.save(step);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      const completedSteps = instance.steps.filter(
        (s) => s.status === OnboardingStatus.COMPLETED,
      ).length;
      const progress = Math.round((completedSteps / instance.steps.length) * 100);

      instance.progress = progress;
      if (progress === 100) {
        instance.status = OnboardingStatus.COMPLETED;
        instance.completedAt = instance.completedAt || new Date();
      } else {
        instance.status = OnboardingStatus.IN_PROGRESS;
        instance.completedAt = null;
      }
      await this._instanceRepo.save(instance);
    }
  }
}
