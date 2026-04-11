import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SeedService } from './seed.service';

import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
import { Company } from '../entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Department, Position, Company])],
  providers: [SeedService],
})
export class SeedModule {}
