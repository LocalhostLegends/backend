import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus, Res, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

import config from '@config/app.config';
import { UserRole } from '@common/enums/user-role.enum';
import type { AuthorizedUser } from '@common/types/authorized-user.type';
import type { RequestWithContext } from '@common/middleware/request-context.middleware';
import { User } from '@database/entities/user.entity';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { ActivateUserDto } from './dto/activate-user.dto';
import { LoginDto } from './dto/login.dto';
import { CreateHrDto } from './dto/create-hr.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';

import { UserRolesGuard } from '../users/guards/user-roles.guard';
import { UserRoles } from '../users/decorators/user-roles.decorator';
import { CurrentUser } from '../users/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

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
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this._authService.registerCompany(registerDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Login successful' })
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: RequestWithContext,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this._authService.login(loginDto, req.context);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Activate user account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Account activated successfully' })
  async activateUser(
    @Body() activateDto: ActivateUserDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this._authService.activateUser(activateDto);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
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

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Tokens refreshed successfully' })
  async refresh(
    @CurrentUser() user: AuthorizedUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const { accessToken, refreshToken } = await this._authService.refresh(user.id);
    this._setRefreshTokenCookie(res, refreshToken);
    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Logged out successfully' })
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  private _setRefreshTokenCookie(res: Response, token: string): void {
    const maxAge = 30 * 24 * 60 * 60 * 1000;

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge,
      path: '/',
    });
  }
}
