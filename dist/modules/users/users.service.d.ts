import { Repository } from 'typeorm';
import { User } from '@database/entities/user.entity';
import { Department } from '@database/entities/department.entity';
import { Position } from '@database/entities/position.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthorizedUser } from '../auth/auth.types';
export declare class UsersService {
    private readonly _usersRepository;
    private readonly _departmentRepository;
    private readonly _positionRepository;
    constructor(_usersRepository: Repository<User>, _departmentRepository: Repository<Department>, _positionRepository: Repository<Position>);
    create(createUserDto: CreateUserDto): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: string, currentUser: AuthorizedUser): Promise<User>;
    findById(id: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: AuthorizedUser): Promise<User>;
    remove(id: string): Promise<void>;
    private _ensureEmailUnique;
    private _findDepartmentById;
    private _findPositionById;
}
