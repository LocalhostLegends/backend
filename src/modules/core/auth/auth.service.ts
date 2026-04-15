import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UserRole } from '@common/enums/user-role.enum';
import { AuthorizedUser } from '@common/types/authorized-user.type';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { UserExistsException } from '@common/exceptions/user-exists.exception';
import { UserStatus } from '@database/enums/user-status.enum';
import { User } from '@database/entities/user.entity';
import { CompaniesService } from '@modules/organization/companies/companies.service';

import { RegisterCompanyDto } from './dto/register-company.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { CreateHrDto } from './dto/create-hr.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtPayload, JwtRefreshPayload, AuthResponse } from './auth.types';

import { TokenService } from '../token/token.service';
import { EmailService } from '../email/email.service';
import { UsersService } from '../users/users.service';
import { InviteService } from '../invite/invite.service';
import { AuditLogService } from '../../audit/audit-log.service';
import type { RequestContext } from '@common/middleware/request-context.middleware';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _companiesService: CompaniesService,
    private readonly _emailService: EmailService,
    private readonly _inviteService: InviteService,
    private readonly _tokenService: TokenService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async registerCompany(registerDto: RegisterCompanyDto): Promise<AuthResponse> {
    const existingUser = await this._usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new UserExistsException(registerDto.email, existingUser.status);
    }

    const company = await this._companiesService.create({
      name: registerDto.companyName,
    });

    const userData = {
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      email: registerDto.email,
      password: registerDto.password,
      role: UserRole.ADMIN,
      companyId: company.id,
      sendInvitation: false,
    };

    const user = await this._usersService.create(userData);

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto, context?: RequestContext): Promise<AuthResponse> {
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
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
    }

    const user = userWithPassword;

    if (user.status === UserStatus.INVITED) {
      throw new UnauthorizedException(ErrorMessages.USER_INVITED);
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException(ErrorMessages.USER_BLOCKED);
    }

    if (user.deletedAt) {
      throw new UnauthorizedException(ErrorMessages.USER_DELETED);
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
      throw new UnauthorizedException(ErrorMessages.USER_BLOCKED);
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
      throw new UnauthorizedException(ErrorMessages.INVALID_CREDENTIALS);
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

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async activateUser(activateDto: ActivateUserDto, ip?: string): Promise<AuthResponse> {
    const user = await this._usersService.activateUser(activateDto.token, activateDto.password, ip);

    const loginLink = `${this._configService.get('FRONTEND_URL')}/login`;
    await this._emailService.sendWelcome(user.email, user.firstName, loginLink);

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async createHr(createHrDto: CreateHrDto, currentUser: AuthorizedUser): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_CREATE_HR);
    }

    const existingUser = await this._usersService.findByEmail(
      createHrDto.email,
      currentUser.companyId,
    );

    if (existingUser) {
      throw new UserExistsException(createHrDto.email, existingUser.status);
    }

    await this._inviteService.createInvite(
      {
        email: createHrDto.email,
        role: UserRole.HR,
      },
      currentUser,
    );

    const user = await this._usersService.findByEmail(createHrDto.email, currentUser.companyId);
    return user!;
  }

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
    currentUser: AuthorizedUser,
  ): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.HR) {
      throw new ForbiddenException(ErrorMessages.FORBIDDEN_CREATE_EMPLOYEE);
    }

    const existingUser = await this._usersService.findByEmail(
      createEmployeeDto.email,
      currentUser.companyId,
    );

    if (existingUser) {
      throw new UserExistsException(createEmployeeDto.email, existingUser.status);
    }

    await this._inviteService.createInvite(
      {
        email: createEmployeeDto.email,
        role: UserRole.EMPLOYEE,
      },
      currentUser,
    );

    const user = await this._usersService.findByEmail(
      createEmployeeDto.email,
      currentUser.companyId,
    );
    return user!;
  }

  async refresh(userId: string): Promise<AuthResponse> {
    const user = await this._usersService.findById(userId);

    if (!user.isActive()) {
      throw new UnauthorizedException(ErrorMessages.USER_NOT_ACTIVE);
    }

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async logout(userId?: string): Promise<{ message: string }> {
    if (userId) {
      await this._tokenService.revokeUserTokens(userId);
    }
    return { message: 'Logged out successfully' };
  }

  private _generateAccessToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company.id,
    };

    return this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_SECRET'),
      expiresIn: this._configService.get('JWT_EXPIRES_IN') || '7d',
    });
  }

  private _generateRefreshToken(user: User): string {
    const payload: JwtRefreshPayload = {
      sub: user.id,
      companyId: user.company.id,
    };

    return this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this._configService.get('JWT_REFRESH_EXPIRES_IN') || '30d',
    });
  }
}
