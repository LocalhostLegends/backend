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
  BeforeInsert
} from 'typeorm';

import { UserRole, UserStatus } from './user.entity.enums';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { Company } from './company.entity';

@Entity('users')
@Index(['companyId', 'email'], { unique: true })
@Index(['companyId', 'status'])
@Index(['companyId', 'role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'first_name' })
  @Index()
  firstName: string;

  @Column({ type: 'varchar', length: 100, name: 'last_name' })
  @Index()
  lastName: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.EMPLOYEE })
  @Index()
  role: UserRole;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.INVITED })
  @Index()
  status: UserStatus;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  email: string;

  @Column({ type: 'varchar', select: false, nullable: true })
  password: string | null;

  @ManyToOne(() => Company, { nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid', name: 'company_id' })
  @Index()
  companyId: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ type: 'uuid', name: 'department_id', nullable: true })
  @Index()
  departmentId: string | null;

  @ManyToOne(() => Position, { nullable: true })
  @JoinColumn({ name: 'position_id' })
  position: Position | null;

  @Column({ type: 'uuid', name: 'position_id', nullable: true })
  @Index()
  positionId: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string | null;

  @Column({ type: 'timestamp', name: 'last_login_at', nullable: true })
  lastLoginAt: Date | null;

  @Column({ type: 'varchar', length: 45, name: 'last_login_ip', nullable: true })
  lastLoginIp: string | null;

  @Column({ type: 'int', name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', name: 'locked_until', nullable: true })
  lockedUntil: Date | null;

  @Column({ type: 'varchar', name: 'activation_token', nullable: true })
  activationToken: string | null;

  @Column({ type: 'timestamp', name: 'activation_token_expires_at', nullable: true })
  activationTokenExpiresAt: Date | null;

  @Column({ type: 'varchar', name: 'reset_password_token', nullable: true })
  resetPasswordToken: string | null;

  @Column({ type: 'timestamp', name: 'reset_password_expires_at', nullable: true })
  resetPasswordExpiresAt: Date | null;

  @Column({ type: 'timestamp', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date | null;

  @Column({ type: 'jsonb', name: 'preferences', nullable: true })
  preferences: Record<string, any>;

  @Column({ type: 'jsonb', name: 'metadata', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date | null;

  @Column({ type: 'uuid', name: 'created_by', nullable: true })
  createdBy: string | null;

  @Column({ type: 'uuid', name: 'updated_by', nullable: true })
  updatedBy: string | null;

  // Helper methods
  isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }

  isInvited(): boolean {
    return this.status === UserStatus.INVITED;
  }

  isBlocked(): boolean {
    return this.status === UserStatus.BLOCKED;
  }

  isDeleted(): boolean {
    return this.status === UserStatus.DELETED;
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

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return this.lockedUntil > new Date();
  }

  canLogin(): boolean {
    return this.isActive() && !this.isLocked();
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
  setDefaults(): void {
    if (!this.preferences) {
      this.preferences = {
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
        },
      };
    }
  }
}