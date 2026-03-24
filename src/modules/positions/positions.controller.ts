import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiExtraModels } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { RequireRole } from '@/common/decorators/require-role.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

import {
  SwaggerCreatePosition,
  SwaggerFindAllPositions,
  SwaggerFindOnePosition,
  SwaggerUpdatePosition,
  SwaggerDeletePosition,
} from './swagger/positions.swagger';
import { PositionResponse } from './swagger/position.schema';

@ApiTags('Positions')
@ApiBearerAuth()
@ApiExtraModels(PositionResponse)
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole('hr')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @Post()
  @SwaggerCreatePosition()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @SwaggerFindAllPositions()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @SwaggerFindOnePosition()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @SwaggerUpdatePosition()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @SwaggerDeletePosition()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}