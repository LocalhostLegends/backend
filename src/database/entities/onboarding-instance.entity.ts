import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Company } from './company.entity';
import { OnboardingTemplate } from './onboarding-template.entity';
import { OnboardingInstanceStep } from './onboarding-instance-step.entity';
import { OnboardingStatus } from '@common/enums/onboarding-status.enum';

@Entity('onboarding_instances')
@Index(['employeeId', 'status'])
export class OnboardingInstance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'employee_id' })
  employee: User;

  @Column({ name: 'employee_id' })
  employeeId: string;

  @ManyToOne(() => OnboardingTemplate)
  @JoinColumn({ name: 'template_id' })
  template: OnboardingTemplate;

  @Column({ name: 'template_id' })
  templateId: string;

  @Column({ type: 'enum', enum: OnboardingStatus, default: OnboardingStatus.IN_PROGRESS })
  status: OnboardingStatus;

  @Column({ type: 'int', default: 0 })
  progress: number;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  companyId: string;

  @OneToMany(() => OnboardingInstanceStep, (step) => step.instance)
  steps: OnboardingInstanceStep[];

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'started_at' })
  startedAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'completed_at' })
  completedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
