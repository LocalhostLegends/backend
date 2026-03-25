import { User } from '@database/entities/user.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { AuthorizedUser } from '../auth/auth.types';
export declare class UsersController {
    private readonly _usersService;
    constructor(_usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string, currentUser: AuthorizedUser): Promise<User>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: AuthorizedUser): Promise<User>;
    remove(id: string): Promise<void>;
}
