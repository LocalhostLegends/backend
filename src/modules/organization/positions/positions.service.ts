import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Position } from '@database/entities/position.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
  ) {}

  async create(createPositionDto: CreatePositionDto): Promise<Position> {
    const existing = await this.positionsRepository.findOne({
      where: { title: createPositionDto.title },
    });

    if (existing) {
      throw new ConflictException(ErrorMessages.POSITION_TITLE_EXISTS(createPositionDto.title));
    }

    const position = this.positionsRepository.create(createPositionDto);
    return this.positionsRepository.save(position);
  }

  async findAll(): Promise<Position[]> {
    return this.positionsRepository.find();
  }

  async findOne(id: string): Promise<Position> {
    const position = await this.positionsRepository.findOne({ where: { id } });
    if (!position) throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(id));

    return position;
  }

  async update(id: string, updatePositionDto: UpdatePositionDto): Promise<Position> {
    const position = await this.findOne(id);

    if (updatePositionDto.title) {
      const existing = await this.positionsRepository.findOne({
        where: { title: updatePositionDto.title },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(ErrorMessages.POSITION_TITLE_EXISTS(updatePositionDto.title));
      }
    }

    Object.assign(position, updatePositionDto);
    return this.positionsRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findOne(id);
    await this.positionsRepository.remove(position);
  }
}
