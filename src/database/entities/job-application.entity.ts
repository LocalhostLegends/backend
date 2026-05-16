import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

import { Job } from './job.entity';
import { Candidate } from './candidate.entity';
import { ApplicationStage } from '@common/enums/application-stage.enum';
import { ApplicationFields } from '@modules/recruitment/applications/swagger/application.fields';
import { CommonFields } from '@common/swagger/common.fields';

@Entity('job_applications')
export class JobApplication {
  @ApiProperty(ApplicationFields.id)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'job_id' })
  @Index()
  job: Job;

  @ApiProperty(ApplicationFields.jobId)
  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Candidate, { nullable: false })
  @JoinColumn({ name: 'candidate_id' })
  @Index()
  candidate: Candidate;

  @ApiProperty(ApplicationFields.candidateId)
  @Column({ name: 'candidate_id' })
  candidateId: string;

  @ApiProperty(ApplicationFields.stage)
  @Column({ type: 'enum', enum: ApplicationStage, default: ApplicationStage.APPLIED })
  stage: ApplicationStage;

  @ApiProperty(ApplicationFields.order)
  @Column({ type: 'int', default: 0 })
  order: number;

  @ApiProperty(CommonFields.createdAt)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty(CommonFields.updatedAt)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
