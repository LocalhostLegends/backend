import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { LeaveRequest } from './leave-request.entity';
import { User } from './user.entity';
import { LeaveAuditEventType } from '@common/enums/leave-audit-event-type.enum';

@Entity('leave_audit_logs')
export class LeaveAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => LeaveRequest, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'leave_request_id' })
  @Index()
  leaveRequest: LeaveRequest;

  @Column({ type: 'uuid', name: 'leave_request_id' })
  leaveRequestId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'actor_id' })
  actor: User | null;

  @Column({ type: 'uuid', nullable: true, name: 'actor_id' })
  actorId: string | null;

  @Column({ type: 'enum', enum: LeaveAuditEventType, name: 'event_type' })
  eventType: LeaveAuditEventType;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
