export interface SeedDepartmentData {
  key: string;
  name: string;
  description: string;
  code: string;
  budget: number;
  isActive: boolean;
  parentDepartmentKey?: string;
  managerKey?: string;
}

export const departmentsData: SeedDepartmentData[] = [
  {
    key: 'people-operations',
    name: 'People Operations',
    description: 'Hiring, onboarding, HR operations, and people development.',
    code: 'PEOPLE',
    budget: 75000,
    isActive: true,
    managerKey: 'hr-lead',
  },
  {
    key: 'engineering',
    name: 'Engineering',
    description: 'Backend, frontend, platform, and internal tooling delivery.',
    code: 'ENG',
    budget: 325000,
    isActive: true,
    managerKey: 'engineering-lead',
  },
  {
    key: 'product',
    name: 'Product',
    description: 'Product strategy, roadmap, and cross-functional planning.',
    code: 'PROD',
    budget: 120000,
    isActive: true,
    managerKey: 'product-manager',
  },
  {
    key: 'qa-automation',
    name: 'QA Automation',
    description: 'Quality assurance, regression coverage, and release readiness.',
    code: 'QA',
    budget: 90000,
    isActive: true,
    parentDepartmentKey: 'engineering',
    managerKey: 'qa-engineer',
  },
  {
    key: 'customer-success',
    name: 'Customer Success',
    description: 'Customer support, retention, and operational issue resolution.',
    code: 'CS',
    budget: 85000,
    isActive: true,
    managerKey: 'customer-success-manager',
  },
];
