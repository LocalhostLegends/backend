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
import { PayrollPeriod } from './payroll-period.entity';
import { PayrollRecordStatus } from '@common/enums/payroll-record-status.enum';

@Entity('payroll_records')
@Index(['payrollPeriodId', 'userId'], { unique: true })
export class PayrollRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => PayrollPeriod, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payroll_period_id' })
  payrollPeriod: PayrollPeriod;

  @Column({ type: 'uuid', name: 'payroll_period_id' })
  payrollPeriodId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'base_salary' })
  baseSalary: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'bonuses_amount', default: 0 })
  bonusesAmount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'deductions_total', default: 0 })
  deductionsTotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, name: 'total_net' })
  totalNet: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'enum', enum: PayrollRecordStatus, default: PayrollRecordStatus.PENDING })
  status: PayrollRecordStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
