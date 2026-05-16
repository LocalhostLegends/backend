import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from '@database/entities/user.entity';
import { Role } from '@database/entities/role.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { Invite } from '@database/entities/invite.entity';
import { UserDocument } from '@database/entities/user-document.entity';

import { UsersService } from './users.service';
import { UserFilterBuilder } from './user-filter.builder';
import { UserDocumentsService } from './user-documents.service';

import { UsersController } from './controllers/users.controller';
import { AvatarController } from './controllers/avatar.controller';
import { UserDocumentsController } from './controllers/user-documents.controller';

import { PaginationModule } from '../../pagination/pagination.module';
import { CustomFieldsModule } from '../../custom-fields/custom-fields.module';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { Token } from '@database/entities/token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Company,
      Department,
      Position,
      Invite,
      Token,
      UserDocument,
    ]),
    PaginationModule,
    CustomFieldsModule,
  ],
  controllers: [UsersController, AvatarController, UserDocumentsController],
  providers: [UsersService, UserFilterBuilder, UserDocumentsService, EmailService, TokenService],
  exports: [UsersService, EmailService, TokenService, UserDocumentsService],
})
export class UsersModule {}
