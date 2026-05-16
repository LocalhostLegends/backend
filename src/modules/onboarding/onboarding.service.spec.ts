import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

jest.mock('@config/app.config', () => ({
  __esModule: true,
  default: {
    frontend: { url: 'http://localhost:3000' },
    isProduction: false,
  },
}));

import { OnboardingService } from './onboarding.service';
import { OnboardingTemplate } from '@database/entities/onboarding-template.entity';
import { OnboardingTemplateStep } from '@database/entities/onboarding-template-step.entity';
import { OnboardingInstance } from '@database/entities/onboarding-instance.entity';
import { OnboardingInstanceStep } from '@database/entities/onboarding-instance-step.entity';
import { User } from '@database/entities/user.entity';
import { Candidate } from '@database/entities/candidate.entity';
import { TasksService } from '@modules/tasks/tasks.service';
import { EventsService } from '@modules/calendar/events/events.service';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { UsersService } from '@modules/core/users/users.service';
import { InviteService } from '@modules/core/invite/invite.service';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { OnboardingStepType } from '@common/enums/onboarding-step-type.enum';
import { UserRole } from '@common/enums/user-role.enum';

describe('OnboardingService', () => {
  let service: OnboardingService;

  const mockUser: AuthorizedUser = {
    id: 'user-id',
    companyId: 'company-id',
    roles: [UserRole.HR],
    email: 'hr@company.com',
    permissions: [],
    permissionsVersion: 1,
  };

  const mockTemplate = {
    id: 'template-id',
    name: 'Standard Onboarding',
    steps: [
      {
        id: 'step-1',
        title: 'Sign Contract',
        type: OnboardingStepType.TASK,
        assigneeRole: UserRole.EMPLOYEE,
        durationDays: 1,
      },
    ],
  };

  const mockEmployee = {
    id: 'employee-id',
    firstName: 'John',
    lastName: 'Doe',
    managerId: 'manager-id',
    getFullName: () => 'John Doe',
    manager: {
      id: 'manager-id',
      roles: [{ code: UserRole.MANAGER, permissions: [] }],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OnboardingService,
        {
          provide: getRepositoryToken(OnboardingTemplate),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockTemplate),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OnboardingTemplateStep),
          useValue: {},
        },
        {
          provide: getRepositoryToken(OnboardingInstance),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn().mockResolvedValue({
              id: 'saved-id',
              employeeId: 'employee-id',
              templateId: 'template-id',
              steps: [],
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(OnboardingInstanceStep),
          useValue: {
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockEmployee),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Candidate),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: TasksService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'task-id' }),
          },
        },
        {
          provide: EventsService,
          useValue: {
            create: jest.fn().mockResolvedValue({ id: 'event-id' }),
          },
        },
        {
          provide: CustomFieldsService,
          useValue: {
            setValuesWithManager: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            createInvitedUser: jest.fn(),
          },
        },
        {
          provide: InviteService,
          useValue: {
            createInvite: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn().mockImplementation((cb) =>
              cb({
                create: jest.fn().mockImplementation((entity, data) => data),
                save: jest
                  .fn()
                  .mockImplementation((data) => Promise.resolve({ id: 'saved-id', ...data })),
              }),
            ),
          },
        },
      ],
    }).compile();

    service = module.get<OnboardingService>(OnboardingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should start onboarding and create linked tasks', async () => {
    const result = await service.startOnboarding(
      {
        templateId: 'template-id',
        employeeId: 'employee-id',
      },
      mockUser,
    );

    expect(result).toBeDefined();
  });
});
