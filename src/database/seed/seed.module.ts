import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';

import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, Position])],
  providers: [SeedService],
})
export class SeedModule {}
