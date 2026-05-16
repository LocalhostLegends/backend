import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { EntityType } from '@common/enums/entity-type.enum';

import { CustomFieldDefinition } from './custom-field-definition.entity';

@Entity('custom_field_values')
@Index(['entityType', 'entityId'])
@Index(['field', 'valueText'])
@Index(['field', 'valueNumber'])
@Index(['field', 'valueDate'])
@Index(['valueEntityType', 'valueEntityId'])
export class CustomFieldValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: EntityType, name: 'entity_type' })
  entityType: EntityType;

  @Column({ type: 'uuid', name: 'entity_id' })
  entityId: string;

  @ManyToOne(() => CustomFieldDefinition, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'field_id' })
  field: CustomFieldDefinition;

  @Column({ type: 'text', nullable: true, name: 'value_text' })
  valueText: string | null;

  @Column({ type: 'decimal', precision: 20, scale: 4, nullable: true, name: 'value_number' })
  valueNumber: number | null;

  @Column({ type: 'boolean', nullable: true, name: 'value_bool' })
  valueBool: boolean | null;

  @Column({ type: 'timestamp', nullable: true, name: 'value_date' })
  valueDate: Date | null;

  @Column({ type: 'uuid', nullable: true, name: 'value_entity_id' })
  valueEntityId: string | null;

  @Column({ type: 'enum', enum: EntityType, nullable: true, name: 'value_entity_type' })
  valueEntityType: EntityType | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
