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
import { plainToInstance } from 'class-transformer';

import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { RequireRole } from '@common/decorators/require-role.decorator';
import { UserRolesGuard } from '@common/guards/user-roles.guard';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import { type AuthorizedUser } from '@common/types/authorized-user.type';

import { PositionsService } from './positions.service';
import { CreatePositionDto } from './dto/create-position.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { PositionResponseDto } from './dto/position-response.dto';
import { PositionSwagger } from './swagger/positions.swagger';

@ApiTags('Positions')
@ApiBearerAuth('JWT-auth')
@Controller('positions')
@UseGuards(JwtAuthGuard, UserRolesGuard)
@RequireRole('hr')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Post()
  @PositionSwagger.create()
  async create(
    @Body() createPositionDto: CreatePositionDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      PositionResponseDto,
      await this.positionsService.create(createPositionDto, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Get()
  @PositionSwagger.findAll()
  async findAll(@CurrentUser() currentUser: AuthorizedUser) {
    return plainToInstance(PositionResponseDto, await this.positionsService.findAll(currentUser), {
      excludeExtraneousValues: true,
    });
  }

  @Get(':id')
  @PositionSwagger.findOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      PositionResponseDto,
      await this.positionsService.findOne(id, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Patch(':id')
  @PositionSwagger.update()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePositionDto: UpdatePositionDto,
    @CurrentUser() currentUser: AuthorizedUser,
  ) {
    return plainToInstance(
      PositionResponseDto,
      await this.positionsService.update(id, updatePositionDto, currentUser),
      { excludeExtraneousValues: true },
    );
  }

  @Delete(':id')
  @PositionSwagger.delete()
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() currentUser: AuthorizedUser) {
    return this.positionsService.remove(id, currentUser);
  }
}
