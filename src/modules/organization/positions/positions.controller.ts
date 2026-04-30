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
import { UserRolesGuard } from '@modules/core/users/guards/user-roles.guard';
import { RequireUserRoles } from '@modules/core/users/decorators/require-user-roles.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@/common/utils/dto.utils';
import { type AuthorizedUser } from '@/modules/core/users/users.types';
import { UserRole } from '@common/enums/user-role.enum';
import { USER_ROLES } from '@/common/constants/common.constants';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('positions')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@RequireUserRoles(...USER_ROLES)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
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
  @swagger.ApiFindAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<PositionResponseDto[]> {
    return transformToDto(PositionResponseDto, await this.positionsService.findAll(currentUser));
  }

  @Get(':id')
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
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
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
  @RequireUserRoles(UserRole.ADMIN, UserRole.HR)
  @swagger.ApiRemove()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.positionsService.remove(id, currentUser);
  }
}
