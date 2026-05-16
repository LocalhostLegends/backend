import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OnboardingTemplate } from '@database/entities/onboarding-template.entity';
import { OnboardingTemplateStep } from '@database/entities/onboarding-template-step.entity';
import { OnboardingInstance } from '@database/entities/onboarding-instance.entity';
import { OnboardingInstanceStep } from '@database/entities/onboarding-instance-step.entity';
import { Company } from '@database/entities/company.entity';
import { User } from '@database/entities/user.entity';
import { Candidate } from '@database/entities/candidate.entity';

import { TasksModule } from '@modules/tasks/tasks.module';
import { CalendarModule } from '@modules/calendar/calendar.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { CustomFieldsModule } from '@modules/custom-fields/custom-fields.module';
import { UsersModule } from '@modules/core/users/users.module';
import { InviteModule } from '@modules/core/invite/invite.module';

import { OnboardingService } from './onboarding.service';
import { OnboardingController } from './onboarding.controller';
import { OnboardingListener } from './listeners/onboarding.listener';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OnboardingTemplate,
      OnboardingTemplateStep,
      OnboardingInstance,
      OnboardingInstanceStep,
      Company,
      User,
      Candidate,
    ]),
    TasksModule,
    CalendarModule,
    NotificationsModule,
    PermissionsModule,
    CustomFieldsModule,
    UsersModule,
    InviteModule,
  ],
  controllers: [OnboardingController],
  providers: [OnboardingService, OnboardingListener],
  exports: [OnboardingService],
})
export class OnboardingModule {}
