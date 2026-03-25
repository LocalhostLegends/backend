import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { User } from '@database/entities/user.entity';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './auth.types';
export declare class AuthController {
    private readonly _authService;
    private readonly _configService;
    constructor(_authService: AuthService, _configService: ConfigService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto, res: Response): Promise<AuthResponse>;
    refresh(user: User): Promise<AuthResponse>;
}
