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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Company } from './company.entity';
import { CandidateFields } from '@modules/recruitment/candidates/swagger/candidate.fields';
import { CommonFields } from '@common/swagger/common.fields';

@Entity('candidates')
@Index(['company', 'email'], { unique: true })
export class Candidate {
  @ApiProperty(CandidateFields.id)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty(CandidateFields.firstName)
  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @ApiProperty(CandidateFields.lastName)
  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @ApiProperty(CommonFields.email)
  @Column({ type: 'varchar', length: 255 })
  email: string;

  @ApiPropertyOptional(CommonFields.phone)
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @ApiPropertyOptional(CandidateFields.resumeUrl)
  @Column({ type: 'varchar', length: 500, nullable: true, name: 'resume_url' })
  resumeUrl: string | null;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  @Index()
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @ApiProperty(CommonFields.createdAt)
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty(CommonFields.updatedAt)
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
