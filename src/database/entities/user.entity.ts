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
  ManyToMany,
  JoinTable,
  OneToOne,
} from 'typeorm';

import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';

import { Department } from './department.entity';
import { Position } from './position.entity';
import { Company } from './company.entity';
import { Role } from './role.entity';
import { UserSecurity } from './user-security.entity';
import { UserSettings } from './user-settings.entity';

@Entity('users')
@Index(['company', 'email'], { unique: true })
@Index(['company', 'status'])
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

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth: Date | null;

  @Column({ type: 'date', nullable: false, name: 'hire_date' })
  hireDate: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

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

  @Column({ type: 'int', default: 1, name: 'permissions_version' })
  permissionsVersion: number;

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

  // Relations
  @OneToOne(() => UserSecurity, (security) => security.user, { cascade: true })
  security?: UserSecurity;

  @OneToOne(() => UserSettings, (settings) => settings.user, { cascade: true })
  settings?: UserSettings;

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
    return this.roles?.some((r) => (r.code as UserRole) === UserRole.ADMIN) ?? false;
  }

  isHR(): boolean {
    return this.roles?.some((r) => (r.code as UserRole) === UserRole.HR) ?? false;
  }

  isEmployee(): boolean {
    return this.roles?.some((r) => (r.code as UserRole) === UserRole.EMPLOYEE) ?? false;
  }

  isSuperAdmin(): boolean {
    return this.roles?.some((r) => (r.code as UserRole) === UserRole.SUPER_ADMIN) ?? false;
  }

  isManager(): boolean {
    return this.roles?.some((r) => (r.code as UserRole) === UserRole.MANAGER) ?? false;
  }

  isLocked(): boolean {
    return this.security?.lockedUntil ? this.security.lockedUntil > new Date() : false;
  }

  canLogin(): boolean {
    return this.isActive() && !this.isLocked() && !!this.security?.emailVerifiedAt;
  }
}
