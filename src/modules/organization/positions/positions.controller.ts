import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@/common/utils/dto.utils';
import { type AuthorizedUser } from '@/modules/core/users/users.types';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { Resource } from '@modules/permissions/decorators/resource.decorator';
import { Position } from '@database/entities/position.entity';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('positions')
@UseGuards(JwtAuthGuard)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @RequirePermission(PermissionAction.POSITION_CREATE)
  @swagger.ApiCreate()
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PositionResponseDto> {
    return transformToDto(
      PositionResponseDto,
      await this.positionsService.create(createPositionDto, currentUser),
    );
  }

  @Get()
  @RequirePermission(PermissionAction.POSITION_READ)
  @swagger.ApiFindAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<PositionResponseDto[]> {
    return transformToDto(PositionResponseDto, await this.positionsService.findAll(currentUser));
  }

  @Get(':id')
  @RequirePermission(PermissionAction.POSITION_READ)
  @Resource(Position)
  @swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PositionResponseDto> {
    return transformToDto(
      PositionResponseDto,
      await this.positionsService.findOne(id, currentUser),
    );
  }

  @Patch(':id')
  @RequirePermission(PermissionAction.POSITION_UPDATE)
  @Resource(Position)
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<PositionResponseDto> {
    return transformToDto(
      PositionResponseDto,
      await this.positionsService.update(id, updatePositionDto, currentUser),
    );
  }

  @Delete(':id')
  @RequirePermission(PermissionAction.POSITION_DELETE)
  @Resource(Position)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.positionsService.remove(id, currentUser);
  }
}
