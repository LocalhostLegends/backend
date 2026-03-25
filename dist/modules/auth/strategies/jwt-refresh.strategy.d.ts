import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '@modules/users/users.service';
import { User } from '@database/entities/user.entity';
import { JwtRefreshPayload } from '../auth.types';
declare const JwtRefreshStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtRefreshStrategy extends JwtRefreshStrategy_base {
    private readonly _usersService;
    constructor(configService: ConfigService, _usersService: UsersService);
    validate(payload: JwtRefreshPayload): Promise<User>;
}
export {};
