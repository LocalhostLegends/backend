import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';

import { UsersService } from './users.service';
import { UserFilterBuilder } from './user-filter.builder';
import { PaginationService } from '@common/pagination/pagination.service';

import { UsersController } from './controller/users.controller';
import { AvatarController } from './controller/avatar.controller';

import { CloudflareModule } from '../cloudflare/cloudflare.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Department, Position]),
    CloudflareModule,
  ],
  controllers: [UsersController, AvatarController],
  providers: [UsersService, PaginationService, UserFilterBuilder],
  exports: [UsersService],
})
export class UsersModule { }


