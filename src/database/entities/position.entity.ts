import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';

import { Company } from './company.entity';
import { User } from './user.entity';

@Entity('positions')
@Index(['company', 'title'], { unique: true })
export class Position {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'title' })
  title: string;

  @Column({ type: 'text', nullable: true, name: 'description' })
  description: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'code' })
  code: string | null;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'min_salary' })
  minSalary: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'max_salary' })
  maxSalary: number | null;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'grade_level' })
  gradeLevel: string | null;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @OneToMany(() => User, (user) => user.position)
  users: User[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
