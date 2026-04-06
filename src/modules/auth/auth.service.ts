import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtRefreshPayload, AuthResponse } from './auth.types';
import { AuditLogService } from '../audit/audit-log.service';
import { RequestContext } from '@common/middleware/request-context.middleware';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this._usersService.create(registerDto);
  }

  async login(
    loginDto: LoginDto,
    context?: RequestContext,
  ): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this._usersService.findByEmail(loginDto.email);

    if (!user) {
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
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

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
      throw new UnauthorizedException('Invalid credentials');
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

    return {
      accessToken: this._generateAccessToken(user),
      refreshToken: this._generateRefreshToken(user),
    };
  }

  async refresh(userId: string): Promise<AuthResponse> {
    const user = await this._usersService.findById(userId);
    const accessToken = this._generateAccessToken(user);

    return { accessToken };
  }

  private _generateAccessToken(user: User): string {
    return this._jwtService.sign<JwtPayload>(
      { sub: user.id, email: user.email, role: user.role },
      {
        secret: this._configService.get('jwt.secret'),
        expiresIn: this._configService.get('jwt.expiresIn'),
      },
    );
  }

  private _generateRefreshToken(user: User): string {
    return this._jwtService.sign<JwtRefreshPayload>(
      { sub: user.id },
      {
        secret: this._configService.get('jwt.refreshSecret'),
        expiresIn: this._configService.get('jwt.refreshExpiresIn'),
      },
    );
  }
}
