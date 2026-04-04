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

@Entity('departments')
@Index(['companyId', 'name'], { unique: true })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  code: string | null;

  // Company relation
  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'uuid' })
  @Index()
  companyId: string;

  // Self-reference for hierarchy
  @ManyToOne(() => Department, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_department_id' })
  parentDepartment: Department | null;

  @Column({ type: 'uuid', nullable: true })
  parentDepartmentId: string | null;

  @OneToMany(() => Department, (department) => department.parentDepartment)
  subDepartments: Department[];

  @OneToMany(() => User, (user) => user.department)
  users: User[];

  // Manager relation
  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'manager_id' })
  manager: User | null;

  @Column({ type: 'uuid', nullable: true })
  managerId: string | null;

  // Optional fields
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  budget: number | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}