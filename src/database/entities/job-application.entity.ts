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

import { Job } from './job.entity';
import { Candidate } from './candidate.entity';
import { ApplicationStage } from '@common/enums/application-stage.enum';

@Entity('job_applications')
export class JobApplication {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Job, { nullable: false })
  @JoinColumn({ name: 'job_id' })
  @Index()
  job: Job;

  @Column({ name: 'job_id' })
  jobId: string;

  @ManyToOne(() => Candidate, { nullable: false })
  @JoinColumn({ name: 'candidate_id' })
  @Index()
  candidate: Candidate;

  @Column({ name: 'candidate_id' })
  candidateId: string;

  @Column({ type: 'enum', enum: ApplicationStage, default: ApplicationStage.APPLIED })
  stage: ApplicationStage;

  @Column({ type: 'int', default: 0 })
  order: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
