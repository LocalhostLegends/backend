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
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer'

import { RequireRole } from '@common/decorators/require-role.decorator';
import { RolesGuard } from '@common/guards/roles.guard';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto'
import { PositionSwagger } from './swagger/positions.swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Positions')
@ApiBearerAuth('JWT-auth')
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole('hr')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @PositionSwagger.create()
  async create(@Body() createPositionDto: CreatePositionDto) {
    return plainToInstance(PositionResponseDto, await this.positionsService.create(createPositionDto), { excludeExtraneousValues: true });
  }

  @Get()
  @PositionSwagger.findAll()
  async findAll() {
    return plainToInstance(PositionResponseDto, await this.positionsService.findAll(), { excludeExtraneousValues: true });
  }

  @Get(':id')
  @PositionSwagger.findOne()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return plainToInstance(PositionResponseDto, await this.positionsService.findOne(id), { excludeExtraneousValues: true });
  }

  @Patch(':id')
  @PositionSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return plainToInstance(PositionResponseDto, await this.positionsService.update(id, updatePositionDto), { excludeExtraneousValues: true });
  }

  @Delete(':id')
  @PositionSwagger.delete()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
