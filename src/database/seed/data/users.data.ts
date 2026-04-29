import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';

export const DEFAULT_SEED_PASSWORD = '123456';

export interface SeedUserPreferences {
  language?: 'en' | 'uk';
  timezone?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  theme?: 'light' | 'dark' | 'system';
}

export interface SeedUserData {
  key: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentKey?: string;
  positionKey?: string;
  phone?: string | null;
  avatar?: string | null;
  createdByKey?: string;
  updatedByKey?: string;
  source: 'invite' | 'manual' | 'import';
  preferences?: SeedUserPreferences;
  lastLoginIp?: string | null;
  failedLoginAttempts?: number;
  lockedForHours?: number;
}

export const usersData: SeedUserData[] = [
  {
    key: 'admin',
    firstName: 'Sergii',
    lastName: 'Melnyk',
    email: 'admin@localhostlegends.dev',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
    departmentKey: 'people-operations',
    positionKey: 'operations-director',
    phone: '+37120000001',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'system',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'hr-lead',
    firstName: 'Anastasiia',
    lastName: 'Kravets',
    email: 'hr.lead@localhostlegends.dev',
    role: UserRole.HR,
    status: UserStatus.ACTIVE,
    departmentKey: 'people-operations',
    positionKey: 'hr-lead',
    phone: '+37120000002',
    createdByKey: 'admin',
    updatedByKey: 'admin',
    source: 'manual',
    preferences: {
      language: 'uk',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'light',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'talent-partner',
    firstName: 'Elina',
    lastName: 'Ozola',
    email: 'talent@localhostlegends.dev',
    role: UserRole.HR,
    status: UserStatus.ACTIVE,
    departmentKey: 'people-operations',
    positionKey: 'talent-partner',
    phone: '+37120000003',
    createdByKey: 'admin',
    updatedByKey: 'hr-lead',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: false, sms: false },
      theme: 'light',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'engineering-lead',
    firstName: 'Marta',
    lastName: 'Berzina',
    email: 'engineering.lead@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'engineering',
    positionKey: 'engineering-lead',
    phone: '+37120000004',
    createdByKey: 'admin',
    updatedByKey: 'hr-lead',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'dark',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'backend-engineer',
    firstName: 'Nikita',
    lastName: 'Ivanov',
    email: 'backend@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'engineering',
    positionKey: 'senior-backend-engineer',
    phone: '+37120000005',
    createdByKey: 'hr-lead',
    updatedByKey: 'engineering-lead',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'system',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'frontend-engineer',
    firstName: 'Eva',
    lastName: 'Lace',
    email: 'frontend@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'engineering',
    positionKey: 'frontend-engineer',
    phone: '+37120000006',
    createdByKey: 'hr-lead',
    updatedByKey: 'engineering-lead',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'system',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'product-manager',
    firstName: 'Janis',
    lastName: 'Kalnins',
    email: 'product@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'product',
    positionKey: 'product-manager',
    phone: '+37120000007',
    createdByKey: 'admin',
    updatedByKey: 'admin',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: false, sms: false },
      theme: 'light',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'qa-engineer',
    firstName: 'Kristaps',
    lastName: 'Ozols',
    email: 'qa@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'qa-automation',
    positionKey: 'qa-engineer',
    phone: '+37120000008',
    createdByKey: 'hr-lead',
    updatedByKey: 'engineering-lead',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'system',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'customer-success-manager',
    firstName: 'Ilze',
    lastName: 'Strode',
    email: 'success@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.ACTIVE,
    departmentKey: 'customer-success',
    positionKey: 'customer-success-manager',
    phone: '+37120000009',
    createdByKey: 'hr-lead',
    updatedByKey: 'admin',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: true, sms: false },
      theme: 'light',
    },
    lastLoginIp: '127.0.0.1',
  },
  {
    key: 'support-specialist',
    firstName: 'Roman',
    lastName: 'Pavlov',
    email: 'support@localhostlegends.dev',
    role: UserRole.EMPLOYEE,
    status: UserStatus.BLOCKED,
    departmentKey: 'customer-success',
    positionKey: 'support-specialist',
    phone: '+37120000010',
    createdByKey: 'hr-lead',
    updatedByKey: 'customer-success-manager',
    source: 'manual',
    preferences: {
      language: 'en',
      timezone: 'Europe/Riga',
      notifications: { email: true, push: false, sms: false },
      theme: 'system',
    },
    failedLoginAttempts: 5,
    lockedForHours: 12,
  },
];
