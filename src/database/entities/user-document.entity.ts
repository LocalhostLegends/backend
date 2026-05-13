import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { DocumentCategory } from '@common/enums/document-category.enum';
import { DocumentStatus } from '@common/enums/document-status.enum';

import { User } from './user.entity';
import { Company } from './company.entity';

@Entity('user_documents')
@Index(['userId', 'category'])
@Index(['companyId', 'status'])
export class UserDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Friendly name: "Passport 2024"

  @Column({ type: 'varchar', length: 255, name: 'file_name' })
  fileName: string; // Original filename: "my_id.pdf"

  @Column({ type: 'varchar', length: 500 })
  key: string; // S3 storage key: "documents/uuid/id_hash.pdf"

  @Column({
    type: 'enum',
    enum: DocumentCategory,
    default: DocumentCategory.OTHER,
  })
  category: DocumentCategory;

  @Column({
    type: 'enum',
    enum: DocumentStatus,
    default: DocumentStatus.PENDING,
  })
  status: DocumentStatus;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @Column({ type: 'int' })
  size: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    expiryDate?: string;
    issueDate?: string;
    documentNumber?: string;
    notes?: string;
  };

  @Column({ name: 'uploaded_by_id' })
  uploadedById: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
