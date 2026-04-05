import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  DeleteDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';

import { UserStatus, UserRole } from '../enums';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { Company } from './company.entity';

@Entity('users')
@Index(['company', 'email'], { unique: true })
@Index(['company', 'status'])
@Index(['company', 'role'])
@Index(['email', 'status'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  password: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  @Index()
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INVITED })
  @Index()
  status: UserStatus;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  departmentId: string | null;

  @ManyToOne(() => Position, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'position_id' })
  position: Position | null;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  positionId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp: string | null;

  @Column({ type: 'int', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'jsonb', default: {} })
  metadata: {
    invitedBy?: string;
    invitedAt?: Date;
    source?: 'invite' | 'manual' | 'import';
    welcomeEmailSent?: boolean;
    lastPasswordChange?: Date;
  };

  @Column({ type: 'jsonb', default: {} })
  preferences: {
    language?: 'en' | 'uk';
    timezone?: string;
    notifications?: {
      email?: boolean;
      push?: boolean;
      sms?: boolean;
    };
    theme?: 'light' | 'dark' | 'system';
  };

  @Column({ type: 'uuid', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', nullable: true })
  updatedBy: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isInvited(): boolean {
    return this.status === UserStatus.INVITED;
  }

  isBlocked(): boolean {
    return this.status === UserStatus.BLOCKED;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isHR(): boolean {
    return this.role === UserRole.HR;
  }

  isEmployee(): boolean {
    return this.role === UserRole.EMPLOYEE;
  }

  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN;
  }

  isLocked(): boolean {
    return this.lockedUntil ? this.lockedUntil > new Date() : false;
  }

  canLogin(): boolean {
    return this.isActive() && !this.isLocked() && !!this.emailVerifiedAt;
  }

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lockedUntil = null;
  }

  @BeforeInsert()
  protected setDefaults(): void {
    if (!this.preferences?.language) {
      this.preferences = {
        language: 'en',
        timezone: 'UTC',
        notifications: { email: true, push: true },
        theme: 'system',
        ...this.preferences,
      };
    }

    if (!this.metadata) {
      this.metadata = {};
    }
  }
}