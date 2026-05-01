import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { User } from '@database/entities/user.entity';

import { UsersModule } from '../core/users/users.module';
import { PermissionsModule } from '../permissions/permissions.module';

import { CompaniesService } from './companies/companies.service';
import { CompaniesController } from './companies/companies.controller';

import { DepartmentsService } from './departments/departments.service';
import { DepartmentsController } from './departments/departments.controller';

import { PositionsService } from './positions/positions.service';
import { PositionsController } from './positions/positions.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Department, Position, User]),
    UsersModule,
    PermissionsModule,
  ],
  controllers: [CompaniesController, DepartmentsController, PositionsController],
  providers: [CompaniesService, DepartmentsService, PositionsService],
  exports: [CompaniesService, DepartmentsService, PositionsService],
})
export class OrganizationModule {}
