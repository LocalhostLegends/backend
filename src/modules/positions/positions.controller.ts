import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PositionsService } from './positions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequireRole } from '@/common/decorators/require-role.decorator';
import { RolesGuard } from '@/common/guards/roles.guard';

import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionSwagger } from './swagger/positions.swagger';

@ApiTags('Positions')
@ApiBearerAuth('JWT-auth')
@Controller('positions')
@UseGuards(JwtAuthGuard, RolesGuard)
@RequireRole('hr')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @PositionSwagger.create()
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @PositionSwagger.findAll()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  @PositionSwagger.findOne()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Patch(':id')
  @PositionSwagger.update()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
  ) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @PositionSwagger.delete()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
