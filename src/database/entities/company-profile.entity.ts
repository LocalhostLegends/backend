import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

@Entity('company_profiles')
export class CompanyProfile {
  @PrimaryColumn('uuid')
  company_id: string;

  @OneToOne(() => Company, (company) => company.profile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'tax_id' })
  taxId: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'registration_number' })
  registrationNumber: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'industry' })
  industry: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'website' })
  website: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'phone' })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'email' })
  email: string | null;

  @Column({ type: 'int', nullable: true, name: 'employee_count' })
  employeeCount: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'company_size' })
  companySize: string | null;
}
