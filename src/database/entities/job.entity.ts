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
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Company } from './company.entity';
import { Department } from './department.entity';
import { User } from './user.entity';
import { JobApplication } from './job-application.entity';
import { JobStatus } from '@common/enums/job-status.enum';
import { JobType } from '@common/enums/job-type.enum';
import { JobFields } from '@modules/recruitment/jobs/swagger/job.fields';
import { CommonFields } from '@common/swagger/common.fields';

@Entity('jobs')
export class Job {
  @ApiProperty(JobFields.id)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty(JobFields.title)
  @Column({ type: 'varchar', length: 255 })
  title: string;

  @ApiPropertyOptional(JobFields.description)
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiPropertyOptional(JobFields.requirements)
  @Column({ type: 'text', nullable: true })
  requirements: string | null;

  @ApiPropertyOptional(JobFields.benefits)
  @Column({ type: 'text', nullable: true })
  benefits: string | null;

  @ApiProperty(JobFields.status)
  @Column({ type: 'enum', enum: JobStatus, default: JobStatus.DRAFT })
  status: JobStatus;

  @ApiProperty(JobFields.type)
  @Column({ type: 'enum', enum: JobType, default: JobType.FULL_TIME })
  type: JobType;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  @Index()
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  @Index()
  department: Department | null;

  @ApiPropertyOptional(JobFields.departmentId)
  @Column({ name: 'department_id', nullable: true })
  departmentId: string | null;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'creator_id' })
  @Index()
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @OneToMany(() => JobApplication, (application) => application.job)
  applications: JobApplication[];

  @ApiPropertyOptional(JobFields.candidatesCount)
  candidatesCount?: number;

  @ApiProperty(CommonFields.createdAt)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty(CommonFields.updatedAt)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
