import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('user_security')
export class UserSecurity {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, (user) => user.security, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true, name: 'password' })
  password: string | null;

  @Column({ type: 'timestamp', nullable: true, name: 'last_login_at' })
  lastLoginAt?: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'last_login_ip' })
  lastLoginIp?: string | null;

  @Column({ type: 'text', nullable: true, name: 'last_login_user_agent' })
  lastLoginUserAgent?: string | null;

  @Column({ type: 'int', default: 0, name: 'failed_login_attempts' })
  failedLoginAttempts: number;

  @Column({ type: 'timestamp', nullable: true, name: 'last_failed_login_at' })
  lastFailedLoginAt?: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'locked_until' })
  lockedUntil?: Date | null;

  @Column({ type: 'timestamp', nullable: true, name: 'email_verified_at' })
  emailVerifiedAt?: Date | null;

  incrementFailedLoginAttempts(): void {
    this.failedLoginAttempts += 1;
    this.lastFailedLoginAt = new Date();
    if (this.failedLoginAttempts >= 5) {
      const lockDuration = 15 * 60 * 1000; // 15 minutes
      this.lockedUntil = new Date(Date.now() + lockDuration);
    }
  }

  resetFailedLoginAttempts(): void {
    this.failedLoginAttempts = 0;
    this.lastFailedLoginAt = null;
    this.lockedUntil = null;
  }
}
