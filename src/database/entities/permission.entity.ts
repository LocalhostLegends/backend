import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  action: string; // e.g., 'user.create'

  @Column({ nullable: true })
  description: string;
}
