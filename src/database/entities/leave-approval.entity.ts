import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { User } from './user.entity';
import { LeaveApprovalAction } from '@common/enums/leave-approval-action.enum';

@Entity('leave_approvals')
export class LeaveApproval {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LeaveRequest, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_request_id' })
  leaveRequest: LeaveRequest;

  @Column({ type: 'uuid', name: 'leave_request_id' })
  leaveRequestId: string;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'approver_id' })
  approver: User;

  @Column({ type: 'uuid', name: 'approver_id' })
  approverId: string;

  @Column({ type: 'enum', enum: LeaveApprovalAction })
  action: LeaveApprovalAction;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
