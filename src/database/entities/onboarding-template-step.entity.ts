import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OnboardingTemplate } from './onboarding-template.entity';
import { OnboardingStepType } from '@common/enums/onboarding-step-type.enum';
import { OnboardingAssigneeRole } from '@common/enums/onboarding-assignee-role.enum';

@Entity('onboarding_template_steps')
export class OnboardingTemplateStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => OnboardingTemplate, (template) => template.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  template: OnboardingTemplate;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: OnboardingStepType })
  type: OnboardingStepType;

  @Column({
    type: 'enum',
    enum: OnboardingAssigneeRole,
    name: 'assignee_role',
    default: OnboardingAssigneeRole.HR,
  })
  assigneeRole: OnboardingAssigneeRole;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'int', name: 'duration_days', default: 0 })
  durationDays: number;
}
