import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { CalendarEventType } from '@common/enums/calendar-event-type.enum';
import { CalendarEventParticipant } from './calendar-event-participant.entity';

@Entity('calendar_events')
@Index(['organizer', 'startTime'])
@Index(['company', 'startTime'])
export class CalendarEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp with time zone', name: 'start_time' })
  startTime: Date;

  @Column({ type: 'timestamp with time zone', name: 'end_time' })
  endTime: Date;

  @Column({
    type: 'enum',
    enum: CalendarEventType,
    default: CalendarEventType.OTHER,
  })
  @Index()
  type: CalendarEventType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'int', default: 0 })
  attendees: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'external_id' })
  @Index()
  externalId: string;

  @Column({ type: 'uuid', nullable: true, name: 'candidate_id' })
  @Index()
  candidateId: string;

  @Column({ type: 'uuid', nullable: true, name: 'vacancy_id' })
  @Index()
  vacancyId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @Column({ name: 'organizer_id' })
  organizerId: string;

  @OneToMany(() => CalendarEventParticipant, (participant) => participant.event, { cascade: true })
  participants: CalendarEventParticipant[];

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
