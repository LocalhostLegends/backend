import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import config from '@config/app.config';
import { UserRole } from '@common/enums/user-role.enum';
import { UserStatus } from '@common/enums/user-status.enum';
import type { AppRequestContext } from '@common/types/common.types';
import { User } from '@database/entities/user.entity';
import { CompaniesService } from '@modules/organization/companies/companies.service';
import { ExceptionFactory } from '@common/exceptions/exception-factory';

import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtRefreshPayload, AuthResponse } from './auth.types';

import { TokenService } from '../token/token.service';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import { AuditLogService } from '../../audit/audit-log.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { TokenType } from '@common/enums/token-type.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _companiesService: CompaniesService,
    private readonly _tokenService: TokenService,
    private readonly _jwtService: JwtService,
    private readonly _emailService: EmailService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async registerCompany(registerDto: RegisterCompanyDto): Promise<AuthResponse> {
    const existingUser = await this._usersService.findByEmail(registerDto.email);

    if (existingUser) {
      if (existingUser.status === UserStatus.INVITED) {
        throw ExceptionFactory.userEmailExistsAndInvited(registerDto.email);
      }
      if (existingUser.status === UserStatus.ACTIVE || existingUser.status === UserStatus.BLOCKED) {
        throw ExceptionFactory.userEmailExistsAndActive(registerDto.email);
      }
      throw ExceptionFactory.userEmailExists(registerDto.email);
    }

    const company = await this._companiesService.create({
      name: registerDto.companyName,
    });

    const userData = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      roles: [UserRole.ADMIN],
      companyId: company.id,
      sendInvitation: false,
    };

    const user = await this._usersService.create(userData);

    const accessToken = await this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto, context?: AppRequestContext): Promise<AuthResponse> {
    const userWithPassword = await this._usersService.findByEmail(loginDto.email, undefined, true);

    if (!userWithPassword) {
      await this.auditLogService.createAuthLog({
        eventType: 'auth.login.failed',
        userId: null,
        emailAttempted: loginDto.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        requestId: context?.requestId,
        method: context?.method,
        path: context?.path,
        success: false,
        failureReason: 'user_not_found',
      });
      throw ExceptionFactory.invalidCredentials();
    }

    const user = userWithPassword;

    if (user.status === UserStatus.INVITED) {
      throw ExceptionFactory.userInvited();
    }

    if (user.status === UserStatus.BLOCKED) {
      throw ExceptionFactory.userBlocked();
    }

    if (user.deletedAt) {
      throw ExceptionFactory.userDeleted();
    }

    if (user.isLocked()) {
      await this.auditLogService.createAuthLog({
        eventType: 'auth.login.failed',
        userId: user.id,
        emailAttempted: loginDto.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        requestId: context?.requestId,
        method: context?.method,
        path: context?.path,
        success: false,
        failureReason: 'account_locked',
      });
      throw ExceptionFactory.userBlocked();
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password!);

    if (!isPasswordValid) {
      await this.auditLogService.createAuthLog({
        eventType: 'auth.login.failed',
        userId: user.id,
        emailAttempted: loginDto.email,
        ip: context?.ip,
        userAgent: context?.userAgent,
        requestId: context?.requestId,
        method: context?.method,
        path: context?.path,
        success: false,
        failureReason: 'wrong_password',
      });

      await this._usersService.incrementFailedLoginAttempts(user.id);
      throw ExceptionFactory.invalidCredentials();
    }

    await this.auditLogService.createAuthLog({
      eventType: 'auth.login.success',
      userId: user.id,
      emailAttempted: loginDto.email,
      ip: context?.ip,
      userAgent: context?.userAgent,
      requestId: context?.requestId,
      method: context?.method,
      path: context?.path,
      success: true,
      failureReason: null,
    });
    await this._usersService.updateLastLogin(user.id, context?.ip, context?.userAgent);

    const accessToken = await this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async refresh(userId: string): Promise<AuthResponse> {
    const user = await this._usersService.findById(userId);

    if (!user.isActive()) {
      throw ExceptionFactory.userNotActive();
    }

    const accessToken = await this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this._usersService.findByEmail(dto.email);

    if (user && user.isActive()) {
      await this._tokenService.revokeUserTokens(user.id, TokenType.RESET_PASSWORD);

      const token = await this._tokenService.createToken(user.id, TokenType.RESET_PASSWORD, 24);

      const resetLink = `${config.frontend.url}/reset-password?token=${token.token}`;

      await this._emailService.sendPasswordResetEmail(user.email, user.firstName, resetLink);

      await this.auditLogService.createAuthLog({
        eventType: 'auth.password.reset.requested',
        userId: user.id,
        emailAttempted: dto.email,
        success: true,
      });
    } else if (user) {
      await this.auditLogService.createAuthLog({
        eventType: 'auth.password.reset.request_failed',
        userId: user.id,
        emailAttempted: dto.email,
        success: false,
        failureReason: 'user_not_active',
      });
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const tokenRecord = await this._tokenService.validateToken(dto.token, TokenType.RESET_PASSWORD);

    if (!tokenRecord.user) {
      throw ExceptionFactory.invalidToken();
    }

    await this._usersService.updatePassword(tokenRecord.user.id, dto.newPassword);
    await this._tokenService.markTokenAsUsed(tokenRecord.id);

    await this.auditLogService.createAuthLog({
      eventType: 'auth.password.reset.success',
      userId: tokenRecord.user.id,
      emailAttempted: tokenRecord.user.email,
      success: true,
    });
  }

  async logout(userId?: string): Promise<{ message: string }> {
    if (userId) {
      await this._tokenService.revokeUserTokens(userId);
    }
    return { message: 'Logged out successfully' };
  }

  private async _generateAccessToken(user: User): Promise<string> {
    const permissions = await this._usersService.getUserPermissions(user.id);
    const roles = user.roles?.map((r) => r.code as UserRole) || [];

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles,
      companyId: user.company.id,
      permissions,
      pv: user.permissionsVersion,
    };

    return this._jwtService.sign(payload, {
      secret: config.jwt.secret,
      expiresIn: config.jwt.expiresIn,
    });
  }

  private _generateRefreshToken(user: User): string {
    const payload: JwtRefreshPayload = {
      sub: user.id,
      companyId: user.company.id,
    };

    return this._jwtService.sign(payload, {
      secret: config.jwt.refreshSecret,
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }
}
