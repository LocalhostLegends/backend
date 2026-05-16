import {
  Injectable,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, FindOptionsWhere } from 'typeorm';
import { LeaveRequest } from '@database/entities/leave-request.entity';
import { LeaveType } from '@database/entities/leave-type.entity';
import { LeaveApproval } from '@database/entities/leave-approval.entity';
import { LeaveStatus } from '@common/enums/leave-status.enum';
import { LeaveApprovalAction } from '@common/enums/leave-approval-action.enum';
import { LeaveAuditEventType } from '@common/enums/leave-audit-event-type.enum';
import { NotificationType } from '@common/enums/notification-type.enum';
import { CalendarEventType } from '@common/enums/calendar-event-type.enum';
import { UserRole } from '@common/enums/user-role.enum';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveAuditService } from './leave-audit.service';
import { EventsService } from '@modules/calendar/events/events.service';
import { NotificationsService } from '@modules/notifications/notifications.service';
import { CreateLeaveRequestDto, LeaveRequestQueryDto } from './dto/leave-request.dto';

@Injectable()
export class LeaveRequestsService {
  constructor(
    @InjectRepository(LeaveRequest)
    private readonly leaveRequestRepository: Repository<LeaveRequest>,
    @InjectRepository(LeaveType)
    private readonly leaveTypeRepository: Repository<LeaveType>,
    private readonly balancesService: LeaveBalancesService,
    private readonly auditService: LeaveAuditService,
    private readonly eventsService: EventsService,
    private readonly notificationsService: NotificationsService,
    private readonly permissions: PermissionsService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateLeaveRequestDto, currentUser: AuthorizedUser): Promise<LeaveRequest> {
    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_CREATE);

    const leaveType = await this.leaveTypeRepository.findOne({
      where: { id: dto.leaveTypeId, companyId: currentUser.companyId },
    });

    if (!leaveType) {
      throw ExceptionFactory.leaveTypeNotFound(dto.leaveTypeId);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be after end date');
    }

    const totalDays = this.calculateTotalDays(startDate, endDate);

    // Check overlap
    const hasOverlap = await this.hasOverlappingRequests(currentUser.id, startDate, endDate);
    if (hasOverlap) {
      throw new ConflictException('You already have a leave request for these dates');
    }

    // Check balance if required
    if (leaveType.requiresBalance) {
      const hasBalance = await this.balancesService.hasSufficientBalance(
        currentUser.id,
        leaveType.id,
        totalDays,
      );
      if (!hasBalance) {
        throw ExceptionFactory.leaveBalanceInsufficient();
      }
    }

    const request = this.leaveRequestRepository.create({
      ...dto,
      employeeId: currentUser.id,
      companyId: currentUser.companyId,
      totalDays,
      status: LeaveStatus.DRAFT,
      startDate,
      endDate,
    });

    const saved = await this.leaveRequestRepository.save(request);

    await this.auditService.log(saved.id, currentUser.id, LeaveAuditEventType.REQUEST_CREATED);

    return saved;
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<LeaveRequest> {
    const request = await this.leaveRequestRepository.findOne({
      where: { id, companyId: currentUser.companyId },
      relations: ['employee', 'leaveType', 'employee.manager', 'employee.roles'],
    });

    if (!request) {
      throw ExceptionFactory.leaveRequestNotFound(id);
    }

    // Permission check: owner, manager, or HR/Admin
    const isOwner = request.employeeId === currentUser.id;
    const isManager = request.employee.managerId === currentUser.id;

    if (!isOwner && !isManager) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_READ);
    }

    return request;
  }

  async findAll(query: LeaveRequestQueryDto, currentUser: AuthorizedUser): Promise<LeaveRequest[]> {
    await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_READ);

    const where: FindOptionsWhere<LeaveRequest> = { companyId: currentUser.companyId };
    if (query.status) where.status = query.status;
    if (query.employeeId) where.employeeId = query.employeeId;

    return this.leaveRequestRepository.find({
      where,
      relations: ['employee', 'leaveType'],
      order: { createdAt: 'DESC' },
    });
  }

  async submit(id: string, currentUser: AuthorizedUser): Promise<LeaveRequest> {
    const request = await this.findOne(id, currentUser);

    if (request.employeeId !== currentUser.id) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_SUBMIT);
    }

    if (request.status !== LeaveStatus.DRAFT) {
      throw new BadRequestException('Only draft requests can be submitted');
    }

    request.status = LeaveStatus.PENDING;
    const saved = await this.leaveRequestRepository.save(request);

    await this.auditService.log(
      saved.id,
      currentUser.id,
      LeaveAuditEventType.SUBMITTED_FOR_APPROVAL,
    );

    // Notify manager
    if (request.employee.managerId) {
      await this.notificationsService.create({
        userId: request.employee.managerId,
        type: NotificationType.LEAVE_REQUEST_CREATED,
        title: 'New Leave Request',
        message: `${request.employee.firstName} ${request.employee.lastName} submitted a leave request.`,
        metadata: { leaveRequestId: saved.id },
      });
    }

    return saved;
  }

  async approve(
    id: string,
    comment: string | undefined,
    currentUser: AuthorizedUser,
  ): Promise<LeaveRequest> {
    const request = await this.findOne(id, currentUser);

    const isAdmin = currentUser.roles.some((role) =>
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
    );

    const employeeIsManagerOrHR = request.employee.roles.some((role) =>
      [UserRole.MANAGER, UserRole.HR].includes(role.code as UserRole),
    );

    // Only Admin can approve Managers or HR staff
    if (employeeIsManagerOrHR && !isAdmin) {
      throw new ForbiddenException(
        'Only administrators can approve leave requests for Managers or HR staff',
      );
    }

    if (request.employeeId === currentUser.id && !isAdmin) {
      throw new ForbiddenException('You cannot approve your own leave request');
    }

    if (request.employee.managerId !== currentUser.id && !isAdmin) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_APPROVE);
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be approved');
    }

    return await this.dataSource.transaction(async (manager) => {
      request.status = LeaveStatus.APPROVED;
      request.approvedAt = new Date();
      const saved = await manager.save(request);

      // Log approval
      const approval = manager.create(LeaveApproval, {
        leaveRequestId: saved.id,
        approverId: currentUser.id,
        action: LeaveApprovalAction.APPROVED,
        comment,
      });
      await manager.save(approval);

      await this.auditService.log(saved.id, currentUser.id, LeaveAuditEventType.APPROVED, {
        comment,
      });

      // Update balance if required
      if (request.leaveType.requiresBalance) {
        await this.balancesService.updateBalance(
          request.employeeId,
          request.leaveTypeId,
          Number(request.totalDays),
          true,
        );
      }

      // Create calendar event
      await this.eventsService.create(
        {
          title: `Leave: ${request.employee.firstName} ${request.employee.lastName} (${request.leaveType.name})`,
          description: request.reason || '',
          startTime: new Date(request.startDate).toISOString(),
          endTime: new Date(request.endDate).toISOString(),
          type: CalendarEventType.ABSENCE,
          participantIds: [request.employeeId],
        },
        currentUser,
      );

      // Notify employee
      await this.notificationsService.create({
        userId: request.employeeId,
        type: NotificationType.LEAVE_REQUEST_APPROVED,
        title: 'Leave Request Approved',
        message: `Your leave request from ${request.startDate.toDateString()} to ${request.endDate.toDateString()} has been approved.`,
        metadata: { leaveRequestId: saved.id },
      });

      return saved;
    });
  }

  async reject(id: string, comment: string, currentUser: AuthorizedUser): Promise<LeaveRequest> {
    const request = await this.findOne(id, currentUser);

    const isAdmin = currentUser.roles.some((role) =>
      [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(role),
    );

    const employeeIsManagerOrHR = request.employee.roles.some((role) =>
      [UserRole.MANAGER, UserRole.HR].includes(role.code as UserRole),
    );

    // Only Admin can reject Managers or HR staff
    if (employeeIsManagerOrHR && !isAdmin) {
      throw new ForbiddenException(
        'Only administrators can reject leave requests for Managers or HR staff',
      );
    }

    if (request.employeeId === currentUser.id) {
      throw new ForbiddenException('You cannot reject your own leave request');
    }

    if (request.employee.managerId !== currentUser.id && !isAdmin) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_REJECT);
    }

    if (request.status !== LeaveStatus.PENDING) {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    return await this.dataSource.transaction(async (manager) => {
      request.status = LeaveStatus.REJECTED;
      request.rejectedAt = new Date();
      const saved = await manager.save(request);

      const approval = manager.create(LeaveApproval, {
        leaveRequestId: saved.id,
        approverId: currentUser.id,
        action: LeaveApprovalAction.REJECTED,
        comment,
      });
      await manager.save(approval);

      await this.auditService.log(saved.id, currentUser.id, LeaveAuditEventType.REJECTED, {
        comment,
      });

      // Notify employee
      await this.notificationsService.create({
        userId: request.employeeId,
        type: NotificationType.LEAVE_REQUEST_REJECTED,
        title: 'Leave Request Rejected',
        message: `Your leave request from ${request.startDate.toDateString()} to ${request.endDate.toDateString()} has been rejected. Comment: ${comment}`,
        metadata: { leaveRequestId: saved.id },
      });

      return saved;
    });
  }

  async cancel(id: string, currentUser: AuthorizedUser): Promise<LeaveRequest> {
    const request = await this.findOne(id, currentUser);

    if (request.employeeId !== currentUser.id) {
      await this.permissions.assertCan(currentUser, PermissionAction.LEAVE_REQUEST_CANCEL);
    }

    if ([LeaveStatus.REJECTED, LeaveStatus.CANCELLED].includes(request.status)) {
      throw new BadRequestException('Request is already rejected or cancelled');
    }

    const wasApproved = request.status === LeaveStatus.APPROVED;

    return await this.dataSource.transaction(async (manager) => {
      request.status = LeaveStatus.CANCELLED;
      request.cancelledAt = new Date();
      const saved = await manager.save(request);

      await this.auditService.log(saved.id, currentUser.id, LeaveAuditEventType.CANCELLED);

      // Restore balance if it was already deducted (was approved)
      if (wasApproved && request.leaveType.requiresBalance) {
        await this.balancesService.updateBalance(
          request.employeeId,
          request.leaveTypeId,
          Number(request.totalDays),
          false,
        );
      }

      return saved;
    });
  }

  private calculateTotalDays(start: Date, end: Date): number {
    let count = 0;
    const curDate = new Date(start.getTime());
    while (curDate <= end) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }

  private async hasOverlappingRequests(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<boolean> {
    const qb = this.leaveRequestRepository
      .createQueryBuilder('request')
      .where('request.employeeId = :employeeId', { employeeId })
      .andWhere('request.status NOT IN (:...statuses)', {
        statuses: [LeaveStatus.REJECTED, LeaveStatus.CANCELLED],
      })
      .andWhere('(request.startDate <= :endDate AND request.endDate >= :startDate)', {
        startDate,
        endDate,
      });

    const count = await qb.getCount();
    return count > 0;
  }
}
