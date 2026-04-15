import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('auth_audit_logs')
export class AuthAuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', type: 'varchar', length: 100 })
  eventType: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId?: string | null;

  @Column({
    name: 'email_attempted',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emailAttempted?: string | null;

  @Column({ name: 'ip', type: 'varchar', length: 255, nullable: true })
  ip?: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent?: string | null;

  @Column({ name: 'request_id', type: 'varchar', length: 255, nullable: true })
  requestId?: string | null;

  @Column({ name: 'method', type: 'varchar', length: 10, nullable: true })
  method?: string | null;

  @Column({ name: 'path', type: 'varchar', length: 500, nullable: true })
  path?: string | null;

  @Column({ name: 'success', type: 'boolean', default: false })
  success: boolean;

  @Column({
    name: 'failure_reason',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  failureReason?: string | null;

  @Column({
    name: 'enrichment_status',
    type: 'varchar',
    length: 50,
    default: 'pending',
  })
  enrichmentStatus: string;

  @Column({ name: 'risk_score', type: 'int', nullable: true })
  riskScore?: number | null;

  @Column({ name: 'suspicious', type: 'boolean', nullable: true })
  suspicious?: boolean | null;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  country?: string | null;

  @Column({ name: 'city', type: 'varchar', length: 100, nullable: true })
  city?: string | null;

  @Column({ name: 'browser', type: 'varchar', length: 100, nullable: true })
  browser?: string | null;

  @Column({ name: 'os', type: 'varchar', length: 100, nullable: true })
  os?: string | null;

  @Column({ name: 'device_type', type: 'varchar', length: 100, nullable: true })
  deviceType?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
