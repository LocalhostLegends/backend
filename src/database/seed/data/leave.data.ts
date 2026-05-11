import { LeaveStatus } from '@common/enums/leave-status.enum';

export const leaveTypesData = [
  {
    name: 'Vacation',
    code: 'VACATION',
    defaultDays: 25,
    requiresBalance: true,
    color: '#4CAF50', // Green
  },
  {
    name: 'Sick Leave',
    code: 'SICK_LEAVE',
    defaultDays: 10,
    requiresBalance: false,
    color: '#F44336', // Red
  },
  {
    name: 'Unpaid Leave',
    code: 'UNPAID_LEAVE',
    defaultDays: 0,
    requiresBalance: false,
    color: '#9E9E9E', // Grey
  },
  {
    name: 'Personal Day',
    code: 'PERSONAL_DAY',
    defaultDays: 3,
    requiresBalance: true,
    color: '#2196F3', // Blue
  },
];

export const leaveRequestsSeedData = [
  {
    userKey: 'eng-1',
    leaveTypeCode: 'VACATION',
    startDateOffset: -5,
    endDateOffset: -1,
    status: LeaveStatus.APPROVED,
    reason: 'Family trip',
  },
  {
    userKey: 'eng-2',
    leaveTypeCode: 'SICK_LEAVE',
    startDateOffset: 0,
    endDateOffset: 2,
    status: LeaveStatus.APPROVED,
    reason: 'Flu',
  },
  {
    userKey: 'eng-3',
    leaveTypeCode: 'UNPAID_LEAVE',
    startDateOffset: 5,
    endDateOffset: 10,
    status: LeaveStatus.PENDING,
    reason: 'Personal matters',
  },
];
