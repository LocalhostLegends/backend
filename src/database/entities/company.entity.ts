import { 
  Entity, 
  Column, 
  OneToMany, 
  PrimaryGeneratedColumn, 
  CreateDateColumn, 
  UpdateDateColumn,
  DeleteDateColumn,
  Index 
} from 'typeorm';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Position } from './position.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, name: 'subdomain', unique: true, nullable: true })
  subdomain: string | null;

  @Column({ type: 'varchar', length: 500, name: 'logo_url', nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 50, name: 'timezone', default: 'UTC' })
  timezone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string | null;

  @Column({ type: 'text', name: 'address', nullable: true })
  address: string | null;

  @Column({ type: 'varchar', length: 20, name: 'phone', nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, name: 'email', nullable: true })
  email: string | null;

  @Column({ type: 'varchar', length: 255, name: 'website', nullable: true })
  website: string | null;

  @Column({ type: 'varchar', length: 50, name: 'tax_id', nullable: true })
  taxId: string | null;

  @Column({ type: 'int', name: 'employee_count', default: 0 })
  employeeCount: number;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, name: 'subscription_plan', default: 'free' })
  subscriptionPlan: string;

  @Column({ type: 'timestamp', name: 'subscription_expires_at', nullable: true })
  subscriptionExpiresAt: Date | null;

  @Column({ type: 'jsonb', name: 'settings', nullable: true })
  settings: Record<string, any>;

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];

  @OneToMany(() => Position, (position) => position.company)
  positions: Position[];

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', name: 'deleted_at' })
  deletedAt: Date | null;
}