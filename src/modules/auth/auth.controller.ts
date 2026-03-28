import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiExtraModels, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import ms, { StringValue } from 'ms';

import { User } from '@database/entities/user.entity';

import { AuthService } from './auth.service';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';

import { AuthResponse } from './auth.types';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthSchema } from './swagger/auth.schema';
import { AuthSwagger } from './swagger/auth.swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@ApiBearerAuth()
@ApiExtraModels(AuthSchema.response)
@ApiExtraModels(AuthSchema.registerBody)
@ApiExtraModels(AuthSchema.loginBody)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly _authService: AuthService,
    private readonly _configService: ConfigService,
  ) {}

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('register')
  @AuthSwagger.register()
  register(@Body() registerDto: RegisterDto): Promise<User> {
    return this._authService.register(registerDto);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @AuthSwagger.login()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const { accessToken, refreshToken } =
      await this._authService.login(loginDto);
    const refreshExpiresIn = this._configService.get<StringValue>(
      'jwt.refreshExpiresIn',
    );

    if (!refreshExpiresIn) {
      throw new Error('Jwt refresh expires in is not defined');
    }

    const isProduction = this._configService.get('nodeEnv') === 'production';

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: ms(refreshExpiresIn),
    });

    return { accessToken };
  }

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @AuthSwagger.refresh()
  refresh(@CurrentUser() user: User): Promise<AuthResponse> {
    return this._authService.refresh(user.id);
  }
}
