import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Job } from '@database/entities/job.entity';
import { Candidate } from '@database/entities/candidate.entity';
import { JobApplication } from '@database/entities/job-application.entity';

import { JobsController } from './jobs/jobs.controller';
import { JobsService } from './jobs/jobs.service';
import { ApplicationsController } from './applications/applications.controller';
import { ApplicationsService } from './applications/applications.service';
import { CandidatesController } from './candidates/candidates.controller';
import { CandidatesService } from './candidates/candidates.service';

@Module({
  imports: [TypeOrmModule.forFeature([Job, Candidate, JobApplication])],
  controllers: [JobsController, ApplicationsController, CandidatesController],
  providers: [JobsService, ApplicationsService, CandidatesService],
  exports: [JobsService, ApplicationsService, CandidatesService],
})
export class RecruitmentModule {}
