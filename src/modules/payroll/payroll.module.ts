import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salary } from '@database/entities/salary.entity';
import { SalaryRevision } from '@database/entities/salary-revision.entity';
import { SalaryRevisionRequest } from '@database/entities/salary-revision-request.entity';
import { Bonus } from '@database/entities/bonus.entity';
import { PayrollPeriod } from '@database/entities/payroll-period.entity';
import { PayrollRecord } from '@database/entities/payroll-record.entity';
import { User } from '@database/entities/user.entity';
import { PayrollController } from './payroll.controller';
import { CompensationService } from './compensation.service';
import { BonusService } from './bonus.service';
import { PayrollService } from './payroll.service';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { AuditModule } from '@modules/audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Salary,
      SalaryRevision,
      SalaryRevisionRequest,
      Bonus,
      PayrollPeriod,
      PayrollRecord,
      User,
    ]),
    PermissionsModule,
    OrganizationModule,
    NotificationsModule,
    AuditModule,
  ],
  controllers: [PayrollController],
  providers: [CompensationService, BonusService, PayrollService],
  exports: [CompensationService, BonusService, PayrollService],
})
export class PayrollModule {}
