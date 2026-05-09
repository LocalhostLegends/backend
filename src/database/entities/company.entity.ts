import {
  Entity,
  Column,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';

import { User } from './user.entity';
import { Department } from './department.entity';
import { Position } from './position.entity';
import { CompanyProfile } from './company-profile.entity';
import { Address } from './address.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  @Index()
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true, name: 'subdomain' })
  subdomain: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'logo_url' })
  logoUrl: string | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC', name: 'timezone' })
  timezone: string;

  @Column({ type: 'boolean', default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ type: 'varchar', length: 50, default: 'free', name: 'subscription_plan' })
  subscriptionPlan: string;

  @Column({ type: 'timestamp', nullable: true, name: 'subscription_expires_at' })
  subscriptionExpiresAt: Date | null;

  @OneToOne(() => CompanyProfile, (profile) => profile.company, { cascade: true })
  profile: CompanyProfile;

  @OneToMany(() => Address, (address) => address.company, { cascade: true })
  addresses: Address[];

  @OneToMany(() => User, (user) => user.company)
  users: User[];

  @OneToMany(() => Department, (department) => department.company)
  departments: Department[];

  @OneToMany(() => Position, (position) => position.company)
  positions: Position[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
