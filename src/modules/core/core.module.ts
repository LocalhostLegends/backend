import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// Entities
import { User } from '@database/entities/user.entity';
import { Token } from '@database/entities/token.entity';
import { Invite } from '@database/entities/invite.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';

// Common
import { PaginationService } from '@common/pagination/pagination.service';

// Config
import config from '@config/app.config';

// Users
import { UsersService } from './users/users.service';
import { UsersController } from './users/controllers/users.controller';
import { AvatarController } from './users/controllers/avatar.controller';
import { UserFilterBuilder } from './users/user-filter.builder';

// Auth
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { JwtRefreshStrategy } from './auth/strategies/jwt-refresh.strategy';

// Invite
import { InviteService } from './invite/invite.service';
import { InviteController } from './invite/invite.controller';

// Token
import { TokenService } from './token/token.service';

// Email
import { EmailService } from './email/email.service';

// Health
import { HealthController } from './health/health.controller';

// Organization
import { OrganizationModule } from '../organization/organization.module';

//Audit
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, Invite, Company, Department, Position]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: config.jwt.secret,
        signOptions: {
          expiresIn: config.jwt.expiresIn,
        },
      }),
    }),
    AuditModule,
    OrganizationModule,
  ],
  controllers: [
    HealthController,
    UsersController,
    AvatarController,
    AuthController,
    InviteController,
  ],
  providers: [
    // Services
    UsersService,
    AuthService,
    InviteService,
    TokenService,
    EmailService,

    // Builders
    UserFilterBuilder,
    PaginationService,

    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [UsersService, AuthService, InviteService, TokenService, EmailService, JwtModule],
})
export class CoreModule {}
