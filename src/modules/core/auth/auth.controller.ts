import { Controller, Post, Body, HttpCode, HttpStatus, Res, Req, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { Throttle } from '@nestjs/throttler';

import config from '@config/app.config';
import type { AuthorizedUser } from '@/modules/core/users/users.types';
import type { AppRequest } from '@common/types/common.types';

import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RegisterCompanyDto } from './dto/register-company.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AccessTokenResponseDto } from './dto/access-token-response.dto';
import { CurrentUser } from '../users/decorators/current-user.decorator';
import { Public } from '@common/decorators/public.decorator';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('auth')
export class AuthController {
  constructor(private readonly _authService: AuthService) {}

  @Public()
  @Post('register-company')
  @HttpCode(HttpStatus.CREATED)
  @swagger.ApiRegisterCompany()
  async registerCompany(
    @Body() registerDto: RegisterCompanyDto,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const {
      accessToken,
      refreshToken,
      user,
      rememberMe = false,
    } = await this._authService.registerCompany(registerDto, req.context);
    this._setRefreshTokenCookie(res, refreshToken, rememberMe);
    return { accessToken, user, rememberMe };
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiLogin()
  async login(
    @Body() loginDto: LoginDto,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const {
      accessToken,
      refreshToken,
      user,
      rememberMe = false,
    } = await this._authService.login(loginDto, req.context);
    this._setRefreshTokenCookie(res, refreshToken, rememberMe);
    return { accessToken, user, rememberMe };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiForgotPassword()
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    await this._authService.forgotPassword(forgotPasswordDto);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiResetPassword()
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this._authService.resetPassword(resetPasswordDto);
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  @swagger.ApiRefreshToken()
  async refresh(
    @CurrentUser() user: AuthorizedUser,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AccessTokenResponseDto> {
    const {
      accessToken,
      refreshToken,
      user: userData,
      rememberMe = false,
    } = await this._authService.refresh(user.id, user.rememberMe, req.context);
    this._setRefreshTokenCookie(res, refreshToken, rememberMe);
    return { accessToken, user: userData, rememberMe };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @swagger.ApiLogout()
  logout(@Res({ passthrough: true }) res: Response): { message: string } {
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      path: '/',
    });

    return { message: 'Logged out successfully' };
  }

  private _setRefreshTokenCookie(res: Response, token: string, rememberMe: boolean = false): void {
    const maxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined;

    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: config.isProduction,
      sameSite: 'strict',
      maxAge,
      path: '/',
    });
  }
}
