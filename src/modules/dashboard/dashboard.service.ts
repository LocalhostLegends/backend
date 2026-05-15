import { Injectable } from '@nestjs/common';
import { LeaveRequestsService } from '@modules/leave/leave-requests.service';
import { LeaveBalancesService } from '@modules/leave/leave-balances.service';
import { TasksService, TaskWithCustomFields } from '@modules/tasks/tasks.service';
import { UsersService } from '@modules/core/users/users.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';
import { LeaveStatus } from '@common/enums/leave-status.enum';
import { UserStatus } from '@common/enums/user-status.enum';
import { JobStatus } from '@common/enums/job-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { JobApplication } from '@database/entities/job-application.entity';
import { Job } from '@database/entities/job.entity';
import { ApplicationStage } from '@common/enums/application-stage.enum';
import {
  EmployeeDashboardDto,
  ManagerDashboardDto,
  HRDashboardDto,
  AdminDashboardDto,
  TaskSummaryDto,
} from './dto/dashboard-response.dto';
import { User } from '@database/entities/user.entity';

interface HiringHistoryRaw {
  month: string;
  count: string;
  sort_date: Date;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly leaveRequestsService: LeaveRequestsService,
    private readonly leaveBalancesService: LeaveBalancesService,
    private readonly tasksService: TasksService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
    @InjectRepository(JobApplication)
    private readonly applicationRepository: Repository<JobApplication>,
    @InjectRepository(Job)
    private readonly jobRepository: Repository<Job>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const sixMonthsAgo = new Date(now.getTime() - 6 * 30 * 24 * 60 * 60 * 1000);

    const [
      hiresLast30Days,
      hiresPrev30Days,
      expectedStarts,
      openJobs,
      hiredApplications,
      lastHire,
      historyRaw,
    ] = await Promise.all([
      this.userRepository.count({
        where: {
          company: { id: user.companyId },
          hireDate: Between(thirtyDaysAgo, now),
        },
      }),
      this.userRepository.count({
        where: {
          company: { id: user.companyId },
          hireDate: Between(sixtyDaysAgo, thirtyDaysAgo),
        },
      }),
      this.userRepository.count({
        where: {
          company: { id: user.companyId },
          hireDate: Between(now, twoWeeksLater),
        },
      }),
      this.jobRepository.find({
        where: { companyId: user.companyId, status: JobStatus.OPEN },
        relations: ['applications'],
      }),
      this.applicationRepository.find({
        where: {
          job: { companyId: user.companyId },
          stage: ApplicationStage.HIRED,
        },
        relations: ['job'],
      }),
      this.userRepository.findOne({
        where: { company: { id: user.companyId } },
        order: { createdAt: 'DESC' },
      }),
      this.userRepository
        .createQueryBuilder('user')
        .select("TO_CHAR(user.created_at, 'Mon')", 'month')
        .addSelect('COUNT(*)', 'count')
        .addSelect('MIN(user.created_at)', 'sort_date')
        .where('user.company_id = :companyId', { companyId: user.companyId })
        .andWhere('user.created_at > :date', { date: sixMonthsAgo })
        .groupBy("TO_CHAR(user.created_at, 'Mon')")
        .orderBy('sort_date', 'ASC')
        .getRawMany<HiringHistoryRaw>(),
    ]);

    const hiringHistory = historyRaw.map((h) => ({
      month: h.month,
      count: parseInt(h.count, 10),
    }));

    // Offer Acceptance Rate: (Hired / (Hired + Current Offers))
    // Note: This is an approximation based on current state.
    const currentOfferCount = await this.applicationRepository.count({
      where: {
        job: { companyId: user.companyId },
        stage: ApplicationStage.OFFER,
      },
    });
    const totalOffers = hiredApplications.length + currentOfferCount;
    const offerAcceptanceRate =
      totalOffers > 0 ? Math.round((hiredApplications.length / totalOffers) * 100) : 0;

    // Median Time to Fill
    const allFillTimes = hiredApplications
      .map((app) => {
        const fillDate = app.updatedAt;
        const openDate = app.job.createdAt;
        return (fillDate.getTime() - openDate.getTime()) / (1000 * 60 * 60 * 24);
      })
      .sort((a, b) => a - b);

    const medianTimeToFillDays =
      allFillTimes.length > 0 ? allFillTimes[Math.floor(allFillTimes.length / 2)] : 0;

    // Compare with last month
    const fillTimesLast30Days = hiredApplications
      .filter((app) => app.updatedAt > thirtyDaysAgo)
      .map((app) => (app.updatedAt.getTime() - app.job.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      .sort((a, b) => a - b);

    const fillTimesPrev30Days = hiredApplications
      .filter((app) => app.updatedAt > sixtyDaysAgo && app.updatedAt <= thirtyDaysAgo)
      .map((app) => (app.updatedAt.getTime() - app.job.createdAt.getTime()) / (1000 * 60 * 60 * 24))
      .sort((a, b) => a - b);

    const medianLast30 =
      fillTimesLast30Days.length > 0
        ? fillTimesLast30Days[Math.floor(fillTimesLast30Days.length / 2)]
        : 0;
    const medianPrev30 =
      fillTimesPrev30Days.length > 0
        ? fillTimesPrev30Days[Math.floor(fillTimesPrev30Days.length / 2)]
        : 0;

    const isFasterThanLastMonth = medianPrev30 > 0 ? medianLast30 < medianPrev30 : true;

    // Stalled Vacancies (no activity for 10+ days)
    const stalledVacanciesCount = openJobs.filter((job) => {
      const hasRecentActivity = job.applications.some((app) => app.updatedAt > tenDaysAgo);
      return !hasRecentActivity && job.updatedAt < tenDaysAgo;
    }).length;

    // High Risk Vacancies (Open > 45 days OR no candidates)
    const fortyFiveDaysAgo = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    const highRiskVacancies = openJobs
      .filter((job) => job.createdAt < fortyFiveDaysAgo || job.applications.length === 0)
      .map((job) => job.title);

    // Alerts
    const alerts = [];
    if (stalledVacanciesCount > 0) {
      alerts.push(`${stalledVacanciesCount} vacancies with no activity for 10+ days`);
    }
    const noCandidatesCount = openJobs.filter((j) => j.applications.length === 0).length;
    if (noCandidatesCount > 0) {
      alerts.push(`${noCandidatesCount} vacancies without candidates`);
    }

    return {
      hiresLast30Days,
      hiresPrev30Days,
      medianTimeToFillDays: Math.round(medianTimeToFillDays),
      isFasterThanLastMonth,
      stalledVacancies: stalledVacanciesCount,
      offerAcceptanceRate,
      highRiskVacancies,
      expectedStartsNext2Weeks: expectedStarts,
      alerts,
      lastHireDate: lastHire ? lastHire.createdAt.toISOString() : null,
      hiringHistory,
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
