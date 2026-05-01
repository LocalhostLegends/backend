import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { InviteStatus } from '@common/enums/invite-status.enum';
import { UserRole } from '@common/enums/user-role.enum';

import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('invites')
@Index(['email', 'company', 'status'])
@Index(['token'])
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, name: 'email' })
  @Index()
  email: string;

  @Column({ type: 'uuid', unique: true, name: 'token' })
  token: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING, name: 'status' })
  status: InviteStatus;

  @Column({ type: 'enum', enum: UserRole, name: 'role' })
  role: UserRole;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  invitedBy: User;

  @Column({ type: 'uuid', nullable: true, name: 'department_id' })
  departmentId: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'position_id' })
  positionId: string | null;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'int', default: 1, name: 'sent_count' })
  sentCount: number;

  @Column({ type: 'timestamp', nullable: true, name: 'accepted_at' })
  acceptedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
