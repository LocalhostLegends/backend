import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Invite } from '@database/entities/invite.entity';

import { UsersService } from './users.service';
import { UserFilterBuilder } from './user-filter.builder';

import { UsersController } from './controllers/users.controller';
import { AvatarController } from './controllers/avatar.controller';

import { PaginationModule } from '../../pagination/pagination.module';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { Token } from '@database/entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Company, Department, Position, Invite, Token]),
    PaginationModule,
  ],
  controllers: [UsersController, AvatarController],
  providers: [UsersService, UserFilterBuilder, EmailService, TokenService],
  exports: [UsersService, EmailService, TokenService],
})
export class UsersModule {}
