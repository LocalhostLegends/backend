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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { UserRolesGuard } from '@common/guards/user-roles.guard';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { transformToDto } from '@common/utils/app.utils';
import { type AuthorizedUser } from '@common/types/authorized-user.type';
import { UserRole, ALL_ROLES } from '@common/enums/user-role.enum';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';

@ApiTags('Positions')
@ApiBearerAuth('JWT-auth')
@Controller('positions')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@RequireRole(...ALL_ROLES)
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @RequireRole(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Create a new position in the current company' })
  @ApiResponse({
    status: 201,
    description: 'Position created successfully',
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
  })
  @ApiResponse({
    status: 409,
    description: 'Position with this title already exists in the current company',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @ApiOperation({ summary: 'Get all positions in the current company' })
  @ApiResponse({
    status: 200,
    description: 'List of positions in the current company',
    type: [PositionResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async findAll(@CurrentUser() currentUser: AuthorizedUser): Promise<PositionResponseDto[]> {
    return transformToDto(PositionResponseDto, await this.positionsService.findAll(currentUser));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get position by ID' })
  @ApiParam({ name: 'id', description: 'Position UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Position found',
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid position ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Position not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @RequireRole(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Update position' })
  @ApiParam({ name: 'id', description: 'Position UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Position updated successfully',
    type: PositionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid position ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Position not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Position with this title already exists in the current company',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
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
  @RequireRole(UserRole.ADMIN, UserRole.HR)
  @ApiOperation({ summary: 'Delete position' })
  @ApiParam({ name: 'id', description: 'Position UUID', type: String })
  @ApiResponse({
    status: 200,
    description: 'Position deleted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid position ID',
  })
  @ApiResponse({
    status: 404,
    description: 'Position not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Access denied. HR role required',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ): Promise<void> {
    await this.positionsService.remove(id, currentUser);
  }
}
