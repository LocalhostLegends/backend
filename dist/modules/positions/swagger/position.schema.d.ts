import { Position } from '@database/entities/position.entity';
export declare class PositionResponse implements Partial<Position> {
    id: string;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}
