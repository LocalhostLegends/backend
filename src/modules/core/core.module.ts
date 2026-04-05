import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';

// Entities
import { User } from '@database/entities/user.entity';
import { Token } from '@database/entities/token.entity';
import { Invite } from '@database/entities/invite.entity';
import { Company } from '@database/entities/company.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';

// Users
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
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

// Common
import { PaginationService } from '@common/pagination/pagination.service';

// Health
import { HealthController } from './health/health.controller';

import { CompaniesService } from '../organization/companies/companies.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Token, Invite, Company, Department, Position]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    HealthController,
    UsersController,
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
    CompaniesService,
    // Builders
    UserFilterBuilder,
    PaginationService,
    // Strategies
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  exports: [
    UsersService,
    AuthService,
    InviteService,
    TokenService,
    EmailService,
    JwtModule,
  ],
})
export class CoreModule { }