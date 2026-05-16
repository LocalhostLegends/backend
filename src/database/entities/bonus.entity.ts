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
import { BonusType } from '@common/enums/bonus-type.enum';
import { BonusStatus } from '@common/enums/bonus-status.enum';

@Entity('bonuses')
@Index(['userId', 'companyId'])
@Index(['status'])
export class Bonus {
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

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'enum', enum: BonusType, default: BonusType.PERFORMANCE })
  type: BonusType;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'enum', enum: BonusStatus, default: BonusStatus.PENDING })
  status: BonusStatus;

  @Column({ type: 'uuid', name: 'payroll_record_id', nullable: true })
  payrollRecordId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
