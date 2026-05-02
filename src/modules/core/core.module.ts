import { Module } from '@nestjs/common';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { InviteModule } from './invite/invite.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [UsersModule, AuthModule, InviteModule],
  controllers: [HealthController],
  exports: [UsersModule, AuthModule, InviteModule],
})
export class CoreModule {}
