import { SalaryPayFrequency } from '@common/enums/salary-pay-frequency.enum';
import { BonusType } from '@common/enums/bonus-type.enum';
import { BonusStatus } from '@common/enums/bonus-status.enum';
import { PayrollPeriodStatus } from '@common/enums/payroll-period-status.enum';

export const salariesData = [
  { userKey: 'eng-lead', amount: 8500, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-1', amount: 5000, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-2', amount: 4800, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-3', amount: 5500, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-4', amount: 4500, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-5', amount: 5200, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-6', amount: 4700, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'eng-7', amount: 4200, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  { userKey: 'admin', amount: 10000, payFrequency: SalaryPayFrequency.MONTHLY, currency: 'USD' },
  {
    userKey: 'hr-manager',
    amount: 6000,
    payFrequency: SalaryPayFrequency.MONTHLY,
    currency: 'USD',
  },
];

export const bonusesData = [
  {
    userKey: 'eng-1',
    amount: 1000,
    type: BonusType.PERFORMANCE,
    reason: 'Excellent performance in Q1',
    status: BonusStatus.APPROVED,
    dateOffset: -10, // 10 days ago (likely in May 2024 if current is June)
  },
  {
    userKey: 'eng-3',
    amount: 500,
    type: BonusType.REFERRAL,
    reason: 'Referral bonus for Senior FE position',
    status: BonusStatus.APPROVED,
    dateOffset: -5,
  },
  {
    userKey: 'eng-lead',
    amount: 2000,
    type: BonusType.SIGN_ON,
    reason: 'Annual management bonus',
    status: BonusStatus.PENDING,
    dateOffset: 2,
  },
];

export const payrollPeriodsData = [
  {
    name: 'May 2026', // Updated to current year for realistic dates
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    status: PayrollPeriodStatus.OPEN, // Changed from PAID to OPEN to see data and allow generation
  },
  {
    name: 'June 2026',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    status: PayrollPeriodStatus.DRAFT,
  },
];
