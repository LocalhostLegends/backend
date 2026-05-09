import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
} from 'typeorm';

import { User } from './user.entity';
import { Company } from './company.entity';
import { Department } from './department.entity';
import { TaskComment } from './task-comment.entity';
import { TaskAttachment } from './task-attachment.entity';
import { TaskReference } from './task-reference.entity';
import { TaskActivity } from './task-activity.entity';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';

@Entity('tasks')
@Index(['companyId', 'stage'])
@Index(['companyId', 'departmentId'])
@Index(['companyId', 'key'], { unique: true })
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, name: 'key' })
  key: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStage, default: TaskStage.TODO })
  stage: TaskStage;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.MEDIUM })
  priority: TaskPriority;

  @Column({ type: 'timestamp with time zone', nullable: true, name: 'due_date' })
  dueDate: Date | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  estimate: string | null;

  @Column({ type: 'int', nullable: true, name: 'story_points' })
  storyPoints: number | null;

  @Column({ type: 'uuid', nullable: true, name: 'sprint_id' })
  sprintId: string | null;

  @Column({ type: 'simple-array', nullable: true })
  labels: string[] | null;

  @Column({ type: 'int', default: 0 })
  order: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @Column({ name: 'creator_id' })
  creatorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @Column({ name: 'assignee_id', nullable: true })
  assigneeId: string | null;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'company_id' })
  @Index()
  companyId: string;

  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: Department | null;

  @Column({ name: 'department_id', nullable: true })
  @Index()
  departmentId: string | null;

  @OneToMany(() => TaskComment, (comment) => comment.task)
  comments: TaskComment[];

  @OneToMany(() => TaskAttachment, (attachment) => attachment.task)
  attachments: TaskAttachment[];

  @OneToMany(() => TaskReference, (reference) => reference.task)
  references: TaskReference[];

  @OneToMany(() => TaskActivity, (activity) => activity.task)
  activities: TaskActivity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
