import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Invite } from '@database/entities/invite.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';

import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

import { UsersModule } from '../users/users.module';
import { OrganizationModule } from '../../organization/organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invite, Company, Department, Position]),
    UsersModule,
    OrganizationModule,
  ],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
