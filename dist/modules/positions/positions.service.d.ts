import { Repository } from 'typeorm';
import { Position } from '@database/entities/position.entity';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
export declare class PositionsService {
    private positionsRepository;
    constructor(positionsRepository: Repository<Position>);
    create(createPositionDto: CreatePositionDto): Promise<Position>;
    findAll(): Promise<Position[]>;
    findOne(id: string): Promise<Position>;
    update(id: string, updatePositionDto: UpdatePositionDto): Promise<Position>;
    remove(id: string): Promise<void>;
}
