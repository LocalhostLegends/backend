import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';

import { TokenType } from '@common/enums/token-type.enum';

import { User } from './user.entity';

@Entity('tokens')
@Index(['token'])
@Index(['user', 'type'])
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 500, unique: true, name: 'token' })
  token: string;

  @Column({ type: 'enum', enum: TokenType, name: 'type' })
  type: TokenType;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ type: 'timestamp', name: 'expires_at' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false, name: 'is_used' })
  isUsed: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'used_at' })
  usedAt: Date | null;

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'used_ip' })
  usedIp: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
