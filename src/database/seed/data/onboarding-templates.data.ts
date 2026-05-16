import { OnboardingStepType } from '../../../common/enums/onboarding-step-type.enum';
import { OnboardingAssigneeRole } from '../../../common/enums/onboarding-assignee-role.enum';

export interface SeedOnboardingStepData {
  title: string;
  description: string;
  type: OnboardingStepType;
  assigneeRole: OnboardingAssigneeRole;
  order: number;
  durationDays: number;
}

export interface SeedOnboardingTemplateData {
  name: string;
  description: string;
  steps: SeedOnboardingStepData[];
}

export const onboardingTemplatesData: SeedOnboardingTemplateData[] = [
  {
    name: 'Standard Employee Onboarding',
    description: 'General onboarding process for all new hires.',
    steps: [
      {
        title: 'Sign Employment Contract',
        description: 'Review and sign the physical or digital employment contract.',
        type: OnboardingStepType.DOCUMENT,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 1,
        durationDays: 1,
      },
      {
        title: 'Hardware Provisioning',
        description: 'Collect your laptop and office supplies from the IT department.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.HR,
        order: 2,
        durationDays: 1,
      },
      {
        title: 'Company Culture Session',
        description: 'Meeting with the CEO to discuss company mission and values.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.HR,
        order: 3,
        durationDays: 2,
      },
      {
        title: 'Welcome Team Lunch',
        description: 'Lunch with your immediate team members.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 4,
        durationDays: 1,
      },
      {
        title: 'Security Compliance Training',
        description: 'Complete mandatory modules on data privacy and physical security.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 5,
        durationDays: 3,
      },
      {
        title: 'Benefits Enrollment',
        description: 'Choose your health insurance and other voluntary benefits.',
        type: OnboardingStepType.DOCUMENT,
        assigneeRole: OnboardingAssigneeRole.HR,
        order: 6,
        durationDays: 5,
      },
      {
        title: 'First Week Reflection',
        description: 'Short meeting with your manager to discuss your first week.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 7,
        durationDays: 5,
      },
    ],
  },
  {
    name: 'Software Engineer Onboarding',
    description: 'Technical onboarding for engineering team members.',
    steps: [
      {
        title: 'Dev Environment Setup',
        description: 'Configure local machine: Docker, Node.js, and necessary IDE plugins.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 1,
        durationDays: 1,
      },
      {
        title: 'Infrastructure Walkthrough',
        description: 'Review cloud provider setup and deployment pipelines with DevOps.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 2,
        durationDays: 2,
      },
      {
        title: 'Architecture Overview',
        description: 'Study the system architecture diagrams and documentation.',
        type: OnboardingStepType.DOCUMENT,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 3,
        durationDays: 2,
      },
      {
        title: 'First Pull Request',
        description: 'Submit a small fix to the codebase to get familiar with the process.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 4,
        durationDays: 3,
      },
      {
        title: 'On-call Process Review',
        description: 'Learn about the incident response and on-call rotation.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 5,
        durationDays: 7,
      },
      {
        title: 'System Design Session',
        description: 'Participate in a design discussion for an upcoming feature.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 6,
        durationDays: 10,
      },
    ],
  },
];
