import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Position } from '@database/entities/position.entity';
import { ErrorMessages } from '@common/exceptions/error-messages';
import { AuthorizedUser } from '@common/types/authorized-user.type';
import { PermissionsService } from '../../permissions/permissions.service';
import { PermissionAction } from '@common/enums/permission-action.enum';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(Position)
    private positionsRepository: Repository<Position>,
    private permissions: PermissionsService,
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
      throw new ConflictException(ErrorMessages.POSITION_TITLE_EXISTS(createPositionDto.title));
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

    if (!position) throw new NotFoundException(ErrorMessages.POSITION_NOT_FOUND(id));

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
        throw new ConflictException(ErrorMessages.POSITION_TITLE_EXISTS(updatePositionDto.title));
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
