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
    budget: 80000,
    isActive: true,
    managerKey: 'hr-manager',
  },
  {
    key: 'engineering',
    name: 'Engineering',
    description: 'Backend, frontend, platform, and internal tooling delivery.',
    code: 'ENG',
    budget: 450000,
    isActive: true,
    managerKey: 'eng-lead',
  },
  {
    key: 'product-design',
    name: 'Product & Design',
    description: 'Product strategy, roadmap, and UI/UX design.',
    code: 'PROD',
    budget: 150000,
    isActive: true,
    managerKey: 'prod-lead',
  },
  {
    key: 'marketing',
    name: 'Marketing',
    description: 'Growth, content, and brand management.',
    code: 'MKTG',
    budget: 120000,
    isActive: true,
    managerKey: 'mkt-lead',
  },
  {
    key: 'sales',
    name: 'Sales',
    description: 'Revenue generation and partnership management.',
    code: 'SALES',
    budget: 140000,
    isActive: true,
    managerKey: 'sales-lead',
  },
  {
    key: 'customer-success',
    name: 'Customer Success',
    description: 'Customer support, retention, and operational issue resolution.',
    code: 'CS',
    budget: 100000,
    isActive: true,
    managerKey: 'cs-lead',
  },
  {
    key: 'finance-admin',
    name: 'Finance & Administration',
    description: 'Financial planning, accounting, and office operations.',
    code: 'FIN',
    budget: 90000,
    isActive: true,
    managerKey: 'fin-lead',
  },
];
