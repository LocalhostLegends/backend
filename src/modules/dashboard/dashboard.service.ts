import { Injectable } from '@nestjs/common';
import { LeaveRequestsService } from '@modules/leave/leave-requests.service';
import { LeaveBalancesService } from '@modules/leave/leave-balances.service';
import { TasksService, TaskWithCustomFields } from '@modules/tasks/tasks.service';
import { UsersService } from '@modules/core/users/users.service';
import { JobsService } from '@modules/recruitment/jobs/jobs.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';
import { LeaveStatus } from '@common/enums/leave-status.enum';
import { UserStatus } from '@common/enums/user-status.enum';
import { JobStatus } from '@common/enums/job-status.enum';
import {
  EmployeeDashboardDto,
  ManagerDashboardDto,
  HRDashboardDto,
  AdminDashboardDto,
  TaskSummaryDto,
} from './dto/dashboard-response.dto';

@Injectable()
export class DashboardService {
  constructor(
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly jobsService: JobsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getEmployeeSummary(user: AuthorizedUser): Promise<EmployeeDashboardDto> {
    const [balances, tasks, unreadCount] = await Promise.all([
      this.leaveBalancesService.findByEmployee(user.id, user),
      this.tasksService.findAll(user, { assigneeId: user.id, limit: 5 }),
      this.notificationsService.getUnreadCount(user.id),
    ]);

    return {
      leaveBalances: balances.map((b) => ({
        type: b.leaveType.name,
        balance: Number(b.remainingDays),
        total: Number(b.totalDays),
      })),
      recentTasks: tasks.map((t) => this.mapTaskToSummary(t)),
      unreadNotificationsCount: unreadCount,
      nextPayrollDate: undefined, // Add logic if available in PayrollService
    };
  }

  async getManagerSummary(user: AuthorizedUser): Promise<ManagerDashboardDto> {
    const [pendingLeaves, teamTasks] = await Promise.all([
      this.leaveRequestsService.findAll({ status: LeaveStatus.PENDING }, user),
      this.tasksService.findAll(user, { departmentId: user.departmentId ?? undefined }),
    ]);

    const urgentTasks = teamTasks
      .filter((t) => t.priority === TaskPriority.URGENT || t.priority === TaskPriority.HIGH)
      .slice(0, 5);

    return {
      pendingLeaveApprovals: pendingLeaves.length,
      teamOnLeaveToday: 0,
      activeTeamTasks: teamTasks.filter((t) => t.stage !== TaskStage.DONE).length,
      urgentTasks: urgentTasks.map((t) => this.mapTaskToSummary(t)),
    };
  }

  async getHRSummary(user: AuthorizedUser): Promise<HRDashboardDto> {
    const [allUsers, jobs] = await Promise.all([
      this.usersService.getCompanyUsers(user.companyId),
      this.jobsService.findAll(user),
    ]);

    return {
      totalEmployees: allUsers.filter((u) => u.status === UserStatus.ACTIVE).length,
      activeVacancies: jobs.filter((j) => j.status === JobStatus.OPEN).length,
      newHiresThisMonth: 0,
      pendingOnboarding: 0,
    };
  }

  async getAdminSummary(user: AuthorizedUser): Promise<AdminDashboardDto> {
    const allUsers = await this.usersService.getCompanyUsers(user.companyId);

    return {
      activeUsersCount: allUsers.filter((u) => u.status === UserStatus.ACTIVE).length,
      recentErrorsCount: 0,
      pendingPayrollPeriods: 0,
      storageUsage: '0 MB',
    };
  }

  private mapTaskToSummary(task: TaskWithCustomFields): TaskSummaryDto {
    return {
      id: task.id,
      title: task.title,
      key: task.key,
      stage: task.stage,
      priority: task.priority,
    };
  }
}
