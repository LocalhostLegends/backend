import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { LeaveType } from './leave-type.entity';

@Entity('leave_balances')
@Index(['employeeId', 'leaveTypeId'], { unique: true })
export class LeaveBalance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ type: 'uuid', name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => LeaveType, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_type_id' })
  leaveType: LeaveType;

  @Column({ type: 'uuid', name: 'leave_type_id' })
  leaveTypeId: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'total_days' })
  totalDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'used_days' })
  usedDays: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0, name: 'remaining_days' })
  remainingDays: number;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
