import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { CustomFieldType } from '@common/enums/custom-field-type.enum';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldOption } from '@modules/custom-fields/custom-fields.types';
import { CustomFieldFields } from '@modules/custom-fields/swagger/custom-fields.fields';

import { Company } from './company.entity';

@Entity('custom_field_definitions')
@Index(['company', 'entityType', 'key'], { unique: true })
export class CustomFieldDefinition {
  @ApiProperty(CustomFieldFields.id)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ApiProperty(CustomFieldFields.entityType)
  @Column({ type: 'enum', enum: EntityType, name: 'entity_type' })
  entityType: EntityType;

  @ApiProperty(CustomFieldFields.key)
  @Column({ type: 'varchar', length: 100, name: 'key' })
  key: string;

  @ApiProperty(CustomFieldFields.label)
  @Column({ type: 'varchar', length: 255, name: 'label' })
  label: string;

  @ApiProperty(CustomFieldFields.type)
  @Column({ type: 'enum', enum: CustomFieldType, name: 'type' })
  type: CustomFieldType;

  @ApiPropertyOptional(CustomFieldFields.options)
  @Column({ type: 'jsonb', nullable: true, name: 'options' })
  options: CustomFieldOption[] | null;

  @ApiPropertyOptional(CustomFieldFields.refEntityType)
  @Column({ type: 'enum', enum: EntityType, nullable: true, name: 'ref_entity_type' })
  refEntityType: EntityType | null;

  @ApiProperty(CustomFieldFields.isRequired)
  @Column({ type: 'boolean', default: false, name: 'is_required' })
  isRequired: boolean;

  @ApiProperty(CustomFieldFields.isFilterable)
  @Column({ type: 'boolean', default: true, name: 'is_filterable' })
  isFilterable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
