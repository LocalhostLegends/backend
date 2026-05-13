import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from '@database/entities/department.entity';
import { User } from '@database/entities/user.entity';

import { OrganizationStructureService } from './organization-structure.service';
import { OrganizationStructureController } from './organization-structure.controller';
import { OrganizationTreeBuilder } from './organization-tree.builder';

@Module({
  imports: [TypeOrmModule.forFeature([Department, User])],
  controllers: [OrganizationStructureController],
  providers: [OrganizationStructureService, OrganizationTreeBuilder],
  exports: [OrganizationStructureService],
})
export class OrganizationStructureModule {}
