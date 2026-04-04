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
import { Company } from './company.entity';
import { User } from './user.entity';
import { InviteStatus } from '../enums';

@Entity('invites')
@Index(['email', 'companyId', 'status'])
@Index(['token'])
@Index(['expiresAt'])
export class Invite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  email: string;

  @Column({ type: 'uuid', unique: true })
  token: string;

  @Column({ type: 'enum', enum: InviteStatus, default: InviteStatus.PENDING })
  status: InviteStatus;

  // Who invited (role)
  @Column({ type: 'varchar', length: 50 })
  role: string; // 'hr' | 'employee'

  // Where invited
  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  // Who invited
  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invited_by' })
  invitedBy: User;

  @Column({ type: 'uuid' })
  @Index()
  invitedById: string;

  // optional: department & position for employee
  @Column({ type: 'uuid', nullable: true })
  departmentId: string | null;

  @Column({ type: 'uuid', nullable: true })
  positionId: string | null;

  // Expiration date
  @Column({ type: 'timestamp' })
  expiresAt: Date;

  // Number of sends (for limits)
  @Column({ type: 'int', default: 1 })
  sentCount: number;

  // When accepted
  @Column({ type: 'timestamp', nullable: true })
  acceptedAt: Date | null;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}