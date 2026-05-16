import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';

@Entity('salary_revisions')
@Index(['userId', 'companyId'])
export class SalaryRevision {
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

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'old_amount' })
  oldAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'new_amount' })
  newAmount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'date', name: 'effective_date' })
  effectiveDate: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'changed_by_id' })
  changedBy: User | null;

  @Column({ type: 'uuid', name: 'changed_by_id', nullable: true })
  changedById: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
