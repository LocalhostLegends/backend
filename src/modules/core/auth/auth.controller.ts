import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response, Request } from 'express';

import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@common/types/authorized-user.type';
import { User } from '@database/entities/user.entity';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { CreateHrDto } from './dto/create-hr.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import type { AuthResponse } from './auth.types';

import { UserRolesGuard } from '../users/guards/user-roles.guard';
import { UserRoles } from '../users/decorators/user-roles.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _configService: ConfigService,
  ) {}

  @Post('register-company')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new company with admin user' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Company and admin created successfully',
  })
  async registerCompany(
    @Body() registerDto: RegisterCompanyDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this._authService.registerCompany(registerDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    loginDto.ipAddress = req.ip || req.socket.remoteAddress;
    const { accessToken, refreshToken } = await this._authService.login(loginDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account activated successfully' })
  async activateUser(
    @Body() activateDto: ActivateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this._authService.activateUser(activateDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('hr')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create HR user (ADMIN only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'HR user created successfully' })
  async createHr(
    @Body() createHrDto: CreateHrDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<User> {
    return this._authService.createHr(createHrDto, currentUser);
  }

  @Post('employee')
  @UseGuards(JwtAuthGuard, UserRolesGuard)
  @UserRoles(UserRole.ADMIN, UserRole.HR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create employee user (ADMIN or HR only)' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Employee user created successfully' })
  async createEmployee(
    @Body() createEmployeeDto: CreateEmployeeDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<User> {
    return this._authService.createEmployee(createEmployeeDto, currentUser);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tokens refreshed successfully' })
  async refresh(
    @CurrentUser() user: AuthorizedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } = await this._authService.refresh(user.id);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken, refreshToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' })
  async logout(@Res({ passthrough: true }) res: Response): Promise<{ message: string }> {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: this._configService.get('NODE_ENV') === 'production',
      sameSite: 'strict',
    });
    return this._authService.logout();
  }

  private _setRefreshTokenCookie(res: Response, token: string): void {
    const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    const isProduction = this._configService.get('NODE_ENV') === 'production';

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge,
      path: '/',
    });
  }
}
