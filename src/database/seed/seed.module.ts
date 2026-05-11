import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';

import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { Company } from '../entities/company.entity';
import { LeaveType } from '../entities/leave-type.entity';
import { LeaveBalance } from '../entities/leave-balance.entity';
import { LeaveRequest } from '../entities/leave-request.entity';
import { Task } from '../entities/task.entity';
import { CalendarEvent } from '../entities/calendar-event.entity';
import { CalendarEventParticipant } from '../entities/calendar-event-participant.entity';
import { Job } from '../entities/job.entity';
import { Candidate } from '../entities/candidate.entity';
import { JobApplication } from '../entities/job-application.entity';
import { OnboardingTemplate } from '../entities/onboarding-template.entity';
import { OnboardingTemplateStep } from '../entities/onboarding-template-step.entity';
import { OnboardingInstance } from '../entities/onboarding-instance.entity';
import { OnboardingInstanceStep } from '../entities/onboarding-instance-step.entity';
import { StorageModule } from '../../modules/storage/storage.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Department,
      Position,
      Company,
      LeaveType,
      LeaveBalance,
      LeaveRequest,
      Task,
      CalendarEvent,
      CalendarEventParticipant,
      Job,
      Candidate,
      JobApplication,
      OnboardingTemplate,
      OnboardingTemplateStep,
      OnboardingInstance,
      OnboardingInstanceStep,
    ]),
    StorageModule,
  ],
  providers: [SeedService],
})
export class SeedModule {}
