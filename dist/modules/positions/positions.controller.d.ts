import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
export declare class PositionsController {
    private readonly positionsService;
    constructor(positionsService: PositionsService);
    create(createPositionDto: CreatePositionDto): Promise<import("../../database/entities/position.entity").Position>;
    findAll(): Promise<import("../../database/entities/position.entity").Position[]>;
    findOne(id: string): Promise<import("../../database/entities/position.entity").Position>;
    update(id: string, updatePositionDto: UpdatePositionDto): Promise<import("../../database/entities/position.entity").Position>;
    remove(id: string): Promise<void>;
}
