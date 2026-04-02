import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './controller/users.controller';
import { User } from '@database/entities/user.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { PaginationService } from '@common/pagination/pagination.service';
import { UserFilterBuilder } from './user-filter.builder';
import { EmailModule } from '@modules/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company, Department, Position]),
    EmailModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, PaginationService, UserFilterBuilder],
  exports: [UsersService],
})
export class UsersModule {}