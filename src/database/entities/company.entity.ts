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

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  subdomain: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  timezone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, default: 'free' })
  subscriptionPlan: string;

  @Column({ type: 'timestamp', nullable: true })
  subscriptionExpiresAt: Date | null;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    email?: string;
    phone?: string;
    website?: string;
    address?: string;
    city?: string;
    country?: string;

    taxId?: string;
    registrationNumber?: string;

    employeeCount?: number;
    industry?: string;
    companySize?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  };

  // Relations
  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];

  @OneToMany(() => Position, (position) => position.company)
  positions: Position[];

  // Timestamps
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}