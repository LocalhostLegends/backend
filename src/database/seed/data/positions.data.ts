export interface SeedPositionData {
  key: string;
  title: string;
  description: string;
  code: string;
  minSalary: number;
  maxSalary: number;
  gradeLevel: string;
  isActive: boolean;
}

export const positionsData: SeedPositionData[] = [
  {
    key: 'operations-director',
    title: 'Operations Director',
    description: 'Owns company operations, planning, and administrative oversight.',
    code: 'OPS-DIR',
    minSalary: 4200,
    maxSalary: 5600,
    gradeLevel: 'L6',
    isActive: true,
  },
  {
    key: 'hr-lead',
    title: 'HR Lead',
    description: 'Drives recruitment, onboarding, and people operations processes.',
    code: 'HR-LEAD',
    minSalary: 2600,
    maxSalary: 3400,
    gradeLevel: 'L4',
    isActive: true,
  },
  {
    key: 'talent-partner',
    title: 'Talent Partner',
    description: 'Supports sourcing, interviewing, and employer branding initiatives.',
    code: 'HR-TAL',
    minSalary: 1900,
    maxSalary: 2600,
    gradeLevel: 'L3',
    isActive: true,
  },
  {
    key: 'engineering-lead',
    title: 'Engineering Lead',
    description: 'Leads engineering execution, code quality, and team delivery.',
    code: 'ENG-LEAD',
    minSalary: 4200,
    maxSalary: 5600,
    gradeLevel: 'L5',
    isActive: true,
  },
  {
    key: 'senior-backend-engineer',
    title: 'Senior Backend Engineer',
    description: 'Builds APIs, integrations, and reliable backend workflows.',
    code: 'BE-SR',
    minSalary: 3200,
    maxSalary: 4600,
    gradeLevel: 'L4',
    isActive: true,
  },
  {
    key: 'frontend-engineer',
    title: 'Frontend Engineer',
    description: 'Implements user-facing product features and internal dashboards.',
    code: 'FE-MID',
    minSalary: 2600,
    maxSalary: 3900,
    gradeLevel: 'L3',
    isActive: true,
  },
  {
    key: 'product-manager',
    title: 'Product Manager',
    description: 'Coordinates roadmap priorities, requirements, and release scope.',
    code: 'PM',
    minSalary: 3000,
    maxSalary: 4300,
    gradeLevel: 'L4',
    isActive: true,
  },
  {
    key: 'qa-engineer',
    title: 'QA Engineer',
    description: 'Maintains regression coverage and release confidence across modules.',
    code: 'QA-ENG',
    minSalary: 2200,
    maxSalary: 3200,
    gradeLevel: 'L3',
    isActive: true,
  },
  {
    key: 'customer-success-manager',
    title: 'Customer Success Manager',
    description: 'Owns high-touch support operations and customer issue escalation.',
    code: 'CS-MGR',
    minSalary: 2300,
    maxSalary: 3200,
    gradeLevel: 'L3',
    isActive: true,
  },
  {
    key: 'support-specialist',
    title: 'Support Specialist',
    description: 'Handles inbound support requests and resolves customer incidents.',
    code: 'CS-SUP',
    minSalary: 1500,
    maxSalary: 2200,
    gradeLevel: 'L2',
    isActive: true,
  },
];
