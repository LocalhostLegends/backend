import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Department } from '../entities/department.entity';
import { Position } from '../entities/position.entity';
export declare class SeedService implements OnModuleInit {
    private readonly _userRepository;
    private readonly _departmentRepository;
    private readonly _positionRepository;
    private readonly logger;
    constructor(_userRepository: Repository<User>, _departmentRepository: Repository<Department>, _positionRepository: Repository<Position>);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
}
