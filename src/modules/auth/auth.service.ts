import { Injectable, UnauthorizedException, ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '@modules/users/users.service';
import { CompaniesService } from '@modules/companies/companies.service';
import { EmailService } from '@modules/email/email.service';
import { User } from '@database/entities/user.entity';
import { UserStatus, UserRole } from '@database/entities/user.entity.enums';

import { RegisterCompanyDto } from './dto/register-company.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { CreateHrDto } from './dto/create-hr.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { JwtPayload, JwtRefreshPayload, AuthResponse } from './auth.types';
import { AuthorizedUser } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _companiesService: CompaniesService,
    private readonly _emailService: EmailService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) { }

  async registerCompany(registerDto: RegisterCompanyDto): Promise<AuthResponse> {
    const existingAdmin = await this._usersService.findFirstAdmin();
    if (existingAdmin) {
      throw new ConflictException('Registration is disabled. System already has an admin.');
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

    const loginLink = `${this._configService.get('FRONTEND_URL')}/login`;
    await this._emailService.sendWelcome(user.email, user.firstName, loginLink);

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this._usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.INVITED) {
      throw new UnauthorizedException('Please activate your account first. Check your email for activation link.');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Your account has been blocked. Please contact administrator.');
    }

    if (user.status === UserStatus.DELETED) {
      throw new UnauthorizedException('Account not found');
    }

    const userWithPassword = await this._usersService.findByEmail(loginDto.email);
    if (!userWithPassword || !userWithPassword.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, userWithPassword.password);

    if (!isPasswordValid) {
      await this._usersService.incrementFailedLoginAttempts(user.id);
      throw new UnauthorizedException('Invalid credentials');
    }

    await this._usersService.updateLastLogin(user.id, loginDto.ipAddress || 'unknown');

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async activateUser(activateDto: ActivateUserDto): Promise<AuthResponse> {
    const user = await this._usersService.activateUser(activateDto.token, activateDto.password);

    const loginLink = `${this._configService.get('FRONTEND_URL')}/login`;
    await this._emailService.sendWelcome(user.email, user.firstName, loginLink);

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async createHr(createHrDto: CreateHrDto, currentUser: AuthorizedUser): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only ADMIN can create HR users');
    }

    const user = await this._usersService.createInvitedUser(
      createHrDto.firstName,
      createHrDto.lastName,
      createHrDto.email,
      UserRole.HR,
      currentUser.companyId,
      currentUser.id,
    );

    return user;
  }

  async createEmployee(createEmployeeDto: CreateEmployeeDto, currentUser: AuthorizedUser): Promise<User> {
    if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.HR) {
      throw new ForbiddenException('Only ADMIN or HR can create employee users');
    }

    const user = await this._usersService.createInvitedUser(
      createEmployeeDto.firstName,
      createEmployeeDto.lastName,
      createEmployeeDto.email,
      UserRole.EMPLOYEE,
      currentUser.companyId,
      currentUser.id,
    );

    return user;
  }

  async refresh(userId: string): Promise<AuthResponse> {
    const user = await this._usersService.findById(userId);

    if (!user.isActive()) {
      throw new UnauthorizedException('User is not active');
    }

    const accessToken = this._generateAccessToken(user);
    const refreshToken = this._generateRefreshToken(user);

    return { accessToken, refreshToken };
  }

  async logout(): Promise<{ message: string }> {
    return { message: 'Logged out successfully' };
  }

  private _generateAccessToken(user: User): string {
    return this._jwtService.sign<JwtPayload>(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        companyId: user.companyId
      },
      {
        secret: this._configService.get('JWT_SECRET'),
        expiresIn: this._configService.get('JWT_EXPIRES_IN') || '7d',
      },
    );
  }

  private _generateRefreshToken(user: User): string {
    return this._jwtService.sign<JwtRefreshPayload>(
      { sub: user.id, companyId: user.companyId },
      {
        secret: this._configService.get('JWT_REFRESH_SECRET'),
        expiresIn: this._configService.get('JWT_REFRESH_EXPIRES_IN') || '30d',
      },
    );
  }
}