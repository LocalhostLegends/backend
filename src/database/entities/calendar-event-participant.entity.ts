import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { CalendarEvent } from './calendar-event.entity';
import { ParticipantStatus } from '@common/enums/participant-status.enum';

@Entity('calendar_event_participants')
@Index(['event', 'user'], { unique: true })
export class CalendarEventParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CalendarEvent, (event) => event.participants, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: CalendarEvent;

  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({
    type: 'enum',
    enum: ParticipantStatus,
    default: ParticipantStatus.PENDING,
  })
  status: ParticipantStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
