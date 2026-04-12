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

import { UserRole } from '@/common/enums/user-role.enum';
import { UserStatus } from '../enums/user-status.enum';
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

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true, name: 'email' })
  @Index()
  email: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true, name: 'password' })
  password: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE, name: 'role' })
  @Index()
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INVITED, name: 'status' })
  @Index()
  status: UserStatus;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @ManyToOne(() => Position, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'position_id' })
  position: Position | null;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'phone' })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'avatar' })
  avatar: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'last_login_ip' })
  lastLoginIp: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'last_login_user_agent' })
  lastLoginUserAgent: string | null;

  @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_failed_login_at' })
  lastFailedLoginAt: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt: Date | null;

  @Column({ type: 'jsonb', default: {}, name: 'metadata' })
  metadata: {
    invitedBy?: string;
    invitedAt?: Date;
    source?: 'invite' | 'manual' | 'import';
    welcomeEmailSent?: boolean;
    lastPasswordChange?: Date;
  };

  @Column({ type: 'jsonb', default: {}, name: 'preferences' })
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

  @Column({ type: 'uuid', nullable: true, name: 'created_by' })
  createdBy: string | null;

  @Column({ type: 'uuid', nullable: true, name: 'updated_by' })
  updatedBy: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;

  // Methods
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
    this.lastFailedLoginAt = new Date();
    if (this.failedLoginAttempts >= 5) {
      this.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lastFailedLoginAt = null;
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
