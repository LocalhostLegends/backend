import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { LeaveModule } from '@modules/leave/leave.module';
import { PayrollModule } from '@modules/payroll/payroll.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { UsersModule } from '@modules/core/users/users.module';
import { RecruitmentModule } from '@modules/recruitment/recruitment.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { JobApplication } from '@database/entities/job-application.entity';
import { Job } from '@database/entities/job.entity';
import { User } from '@database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobApplication, Job, User]),
    LeaveModule,
    PayrollModule,
    TasksModule,
    UsersModule,
    RecruitmentModule,
    NotificationsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
