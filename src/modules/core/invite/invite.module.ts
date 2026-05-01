import { Module } from '@nestjs/common';

import { InviteService } from './invite.service';
import { InviteController } from './invite.controller';

import { UsersModule } from '../users/users.module';
import { OrganizationModule } from '../../organization/organization.module';

@Module({
  imports: [UsersModule, OrganizationModule],
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
