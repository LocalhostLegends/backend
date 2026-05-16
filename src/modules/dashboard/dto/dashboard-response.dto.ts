import { ApiProperty } from '@nestjs/swagger';

export class LeaveBalanceDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  balance: number;

  @ApiProperty()
  total: number;
}

export class TaskSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  stage: string;

  @ApiProperty()
  priority: string;
}

export class EmployeeDashboardDto {
  @ApiProperty({ type: [LeaveBalanceDto] })
  leaveBalances: LeaveBalanceDto[];

  @ApiProperty({ type: [TaskSummaryDto] })
  recentTasks: TaskSummaryDto[];

  @ApiProperty()
  unreadNotificationsCount: number;

  @ApiProperty({ required: false })
  nextPayrollDate?: string;
}

export class ManagerDashboardDto {
  @ApiProperty()
  pendingLeaveApprovals: number;

  @ApiProperty()
  teamOnLeaveToday: number;

  @ApiProperty()
  activeTeamTasks: number;

  @ApiProperty({ type: [TaskSummaryDto] })
  urgentTasks: TaskSummaryDto[];
}

export class HRDashboardDto {
  @ApiProperty({ description: 'Number of hires in the last 30 days' })
  hiresLast30Days: number;

  @ApiProperty({ description: 'Number of hires in the previous 30 days' })
  hiresPrev30Days: number;

  @ApiProperty({ description: 'Median time to fill a vacancy in days' })
  medianTimeToFillDays: number;

  @ApiProperty({ description: 'Whether the time to fill is faster than last month' })
  isFasterThanLastMonth: boolean;

  @ApiProperty({ description: 'Number of stalled vacancies (no activity for 10+ days)' })
  stalledVacancies: number;

  @ApiProperty({ description: 'Percentage of offers accepted' })
  offerAcceptanceRate: number;

  @ApiProperty({
    type: [String],
    description: 'List of vacancy titles that are considered high risk',
  })
  highRiskVacancies: string[];

  @ApiProperty({ description: 'Number of expected employee starts in the next 2 weeks' })
  expectedStartsNext2Weeks: number;

  @ApiProperty({ type: [String], description: 'System alerts for HR attention' })
  alerts: string[];

  @ApiProperty({ description: 'Date of the last hire', nullable: true })
  lastHireDate: string | null;

  @ApiProperty({ description: 'Monthly hiring history for the last 6 months' })
  hiringHistory: { month: string; count: number }[];
}

export class AdminDashboardDto {
  @ApiProperty()
  activeUsersCount: number;

  @ApiProperty()
  recentErrorsCount: number;

  @ApiProperty()
  pendingPayrollPeriods: number;

  @ApiProperty()
  storageUsage: string;
}
