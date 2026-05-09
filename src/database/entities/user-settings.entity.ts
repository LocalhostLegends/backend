import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, BeforeInsert } from 'typeorm';
import { User } from './user.entity';

@Entity('user_settings')
export class UserSettings {
  @PrimaryColumn('uuid')
  user_id: string;

  @OneToOne(() => User, (user) => user.settings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 10, default: 'en', name: 'language' })
  language: string;

  @Column({ type: 'varchar', length: 50, default: 'UTC', name: 'timezone' })
  timezone: string;

  @Column({ type: 'jsonb', default: { email: true, push: true }, name: 'notifications' })
  notifications: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };

  @Column({ type: 'varchar', length: 20, default: 'system', name: 'theme' })
  theme: string;

  @Column({ type: 'jsonb', default: {}, name: 'metadata' })
  metadata: {
    invitedBy?: string;
    invitedAt?: Date;
    source?: 'invite' | 'manual' | 'import';
    welcomeEmailSent?: boolean;
    lastPasswordChange?: Date;
  };

  @BeforeInsert()
  protected setDefaults(): void {
    if (!this.notifications) {
      this.notifications = { email: true, push: true };
    }
    if (!this.metadata) {
      this.metadata = {};
    }
  }
}
