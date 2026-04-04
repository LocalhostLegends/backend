import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { User } from '@database/entities/user.entity';

// Companies
import { CompaniesService } from './companies/companies.service';
import { CompaniesController } from './companies/companies.controller';

// Departments
import { DepartmentsService } from './departments/departments.service';
import { DepartmentsController } from './departments/departments.controller';

// Positions
import { PositionsService } from './positions/positions.service';
import { PositionsController } from './positions/positions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Company, Department, Position, User])],
  controllers: [
    CompaniesController,
    DepartmentsController,
    PositionsController,
  ],
  providers: [
    CompaniesService,
    DepartmentsService,
    PositionsService,
  ],
  exports: [
    CompaniesService,
    DepartmentsService,
    PositionsService,
  ],
})
export class OrganizationModule { }