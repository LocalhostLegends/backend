import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { AddressType } from '@common/enums/address-type.enum';
import { Company } from './company.entity';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, name: 'country' })
  country: string;

  @Column({ type: 'varchar', length: 100, name: 'city' })
  city: string;

  @Column({ type: 'varchar', length: 255, name: 'street' })
  street: string;

  @Column({ type: 'varchar', length: 20, nullable: true, name: 'postal_code' })
  postalCode: string | null;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.LEGAL, name: 'type' })
  type: AddressType;

  @ManyToOne(() => Company, (company) => company.addresses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;
}
