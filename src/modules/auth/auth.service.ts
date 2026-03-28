import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, JwtRefreshPayload, AuthResponse } from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly _usersService: UsersService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<User> {
    return this._usersService.create(registerDto);
  }

  async login(
    loginDto: LoginDto,
  ): Promise<AuthResponse & { refreshToken: string }> {
    const user = await this._usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
