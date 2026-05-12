import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { SalaryRevisionStatus } from '@common/enums/salary-revision-status.enum';

@Entity('salary_revision_requests')
@Index(['userId', 'companyId'])
@Index(['status'])
export class SalaryRevisionRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'company_id' })
  companyId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'current_amount' })
  currentAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'requested_amount' })
  requestedAmount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'text' })
  reason: string;

  @Column({
    type: 'enum',
    enum: SalaryRevisionStatus,
    default: SalaryRevisionStatus.PENDING,
  })
  status: SalaryRevisionStatus;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by_id' })
  reviewedBy: User | null;

  @Column({ type: 'uuid', name: 'reviewed_by_id', nullable: true })
  reviewedById: string | null;

  @Column({ type: 'text', nullable: true, name: 'review_note' })
  reviewNote: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'reviewed_at' })
  reviewedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
