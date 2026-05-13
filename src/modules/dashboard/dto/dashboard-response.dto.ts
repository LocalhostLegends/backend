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
  @ApiProperty()
  totalEmployees: number;

  @ApiProperty()
  activeVacancies: number;

  @ApiProperty()
  newHiresThisMonth: number;

  @ApiProperty()
  pendingOnboarding: number;
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
