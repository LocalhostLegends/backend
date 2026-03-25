import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './auth.types';
export declare class AuthService {
    private readonly _usersService;
    private readonly _jwtService;
    private readonly _configService;
    constructor(_usersService: UsersService, _jwtService: JwtService, _configService: ConfigService);
    register(registerDto: RegisterDto): Promise<User>;
    login(loginDto: LoginDto): Promise<AuthResponse & {
        refreshToken: string;
    }>;
    refresh(userId: string): Promise<AuthResponse>;
    private _generateAccessToken;
    private _generateRefreshToken;
}
