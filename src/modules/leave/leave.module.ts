import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaveRequest } from '@database/entities/leave-request.entity';
import { LeaveType } from '@database/entities/leave-type.entity';
import { LeaveBalance } from '@database/entities/leave-balance.entity';
import { LeaveApproval } from '@database/entities/leave-approval.entity';
import { LeaveAuditLog } from '@database/entities/leave-audit-log.entity';
import { User } from '@database/entities/user.entity';
import { LeaveController } from './leave.controller';
import { LeaveRequestsService } from './leave-requests.service';
import { LeaveBalancesService } from './leave-balances.service';
import { LeaveTypesService } from './leave-types.service';
import { LeaveAuditService } from './leave-audit.service';
import { LeaveUserListener } from './listeners/leave-user.listener';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { CalendarModule } from '@modules/calendar/calendar.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LeaveRequest,
      LeaveType,
      LeaveBalance,
      LeaveApproval,
      LeaveAuditLog,
      User,
    ]),
    PermissionsModule,
    CalendarModule,
    NotificationsModule,
  ],
  controllers: [LeaveController],
  providers: [
    LeaveRequestsService,
    LeaveBalancesService,
    LeaveTypesService,
    LeaveAuditService,
    LeaveUserListener,
  ],
  exports: [LeaveRequestsService, LeaveBalancesService, LeaveTypesService],
})
export class LeaveModule {}
