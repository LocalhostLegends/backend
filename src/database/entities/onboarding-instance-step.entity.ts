import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OnboardingInstance } from './onboarding-instance.entity';
import { OnboardingTemplateStep } from './onboarding-template-step.entity';
import { OnboardingStatus } from '@common/enums/onboarding-status.enum';
import { User } from './user.entity';

@Entity('onboarding_instance_steps')
export class OnboardingInstanceStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingInstance, (instance) => instance.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instance_id' })
  instance: OnboardingInstance;

  @Column({ name: 'instance_id' })
  instanceId: string;

  @ManyToOne(() => OnboardingTemplateStep)
  @JoinColumn({ name: 'template_step_id' })
  templateStep: OnboardingTemplateStep;

  @Column({ name: 'template_step_id' })
  templateStepId: string;

  @Column({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.PENDING })
  status: OnboardingStatus;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to_id' })
  assignedTo: User | null;

  @Column({ name: 'assigned_to_id', nullable: true })
  assignedToId: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @Column({ type: 'uuid', name: 'linked_task_id', nullable: true })
  linkedTaskId: string | null;

  @Column({ type: 'uuid', name: 'linked_calendar_event_id', nullable: true })
  linkedCalendarEventId: string | null;
}
