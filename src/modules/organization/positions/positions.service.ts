import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Position } from '@database/entities/position.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { PermissionsService } from '@modules/permissions/permissions.service';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionsErrors } from './positions.errors';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
    private readonly permissions: PermissionsService,
  ) {}

  async create(
    createPositionDto: CreatePositionDto,
    currentUser: AuthorizedUser,
  ): Promise<Position> {
    this.permissions.assertCan(currentUser, PermissionAction.POSITION_CREATE);

    const existing = await this.positionsRepository.findOne({
      where: {
        title: createPositionDto.title,
        company: { id: currentUser.companyId },
      },
    });

    if (existing) {
      throw new ConflictException(PositionsErrors.positionTitleExists(createPositionDto.title));
    }

    const position = this.positionsRepository.create({
      ...createPositionDto,
      company: { id: currentUser.companyId },
    });

    return this.positionsRepository.save(position);
  }

  async findAll(currentUser: AuthorizedUser): Promise<Position[]> {
    this.permissions.assertCan(currentUser, PermissionAction.POSITION_READ);

    return this.positionsRepository.find({
      where: { company: { id: currentUser.companyId } },
    });
  }

  async findOne(id: string, currentUser: AuthorizedUser): Promise<Position> {
    const position = await this.positionsRepository.findOne({
      where: { id },
      relations: ['company'],
    });

    if (!position) throw new NotFoundException(PositionsErrors.positionNotFound(id));

    this.permissions.assertCan(currentUser, PermissionAction.POSITION_READ, position);

    return position;
  }

  async update(
    id: string,
    updatePositionDto: UpdatePositionDto,
    currentUser: AuthorizedUser,
  ): Promise<Position> {
    const position = await this.findOne(id, currentUser);

    this.permissions.assertCan(currentUser, PermissionAction.POSITION_UPDATE, position);

    if (updatePositionDto.title && updatePositionDto.title !== position.title) {
      const existing = await this.positionsRepository.findOne({
        where: {
          title: updatePositionDto.title,
          company: { id: currentUser.companyId },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(PositionsErrors.positionTitleExists(updatePositionDto.title));
      }
    }

    Object.assign(position, updatePositionDto);
    return this.positionsRepository.save(position);
  }

  async remove(id: string, currentUser: AuthorizedUser): Promise<void> {
    const position = await this.findOne(id, currentUser);

    this.permissions.assertCan(currentUser, PermissionAction.POSITION_DELETE, position);

    await this.positionsRepository.remove(position);
  }
}
