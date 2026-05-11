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
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 1,
        durationDays: 0,
      },
      {
        title: 'Hardware Setup',
        description: 'Provision laptop, monitor, and other necessary equipment.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.HR,
        order: 2,
        durationDays: 1,
      },
      {
        title: 'Welcome Meeting',
        description: 'Introduction to the team and company culture.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 3,
        durationDays: 1,
      },
      {
        title: 'Security Awareness Training',
        description: 'Complete the mandatory security and data privacy course.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 4,
        durationDays: 3,
      },
    ],
  },
  {
    name: 'Software Engineer Onboarding',
    description: 'Technical onboarding for engineering team members.',
    steps: [
      {
        title: 'Development Environment Setup',
        description: 'Install IDE, Docker, and clone main repositories.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 1,
        durationDays: 1,
      },
      {
        title: 'Infrastructure Overview',
        description: 'Meeting with DevOps to discuss CI/CD and cloud architecture.',
        type: OnboardingStepType.MEETING,
        assigneeRole: OnboardingAssigneeRole.MANAGER,
        order: 2,
        durationDays: 2,
      },
      {
        title: 'First Pull Request',
        description: 'Submit a small bug fix or documentation update.',
        type: OnboardingStepType.TASK,
        assigneeRole: OnboardingAssigneeRole.EMPLOYEE,
        order: 3,
        durationDays: 5,
      },
    ],
  },
];
