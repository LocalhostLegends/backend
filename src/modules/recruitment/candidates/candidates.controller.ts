import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';

import { CandidatesService, CandidateWithCustomFields } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly _candidatesService: CandidatesService) {}

  @Post()
  @swagger.ApiCreate()
  async create(
    @Body(ValidationPipe) createDto: CreateCandidateDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CandidateWithCustomFields> {
    return this._candidatesService.create(createDto, user);
  }

  @Get()
  @swagger.ApiGetAll()
  async findAll(@CurrentUser() user: AuthorizedUser): Promise<CandidateWithCustomFields[]> {
    return this._candidatesService.findAll(user);
  }

  @Get(':id')
  @swagger.ApiGetOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CandidateWithCustomFields> {
    return this._candidatesService.findOne(id, user);
  }

  @Patch(':id')
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateCandidateDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CandidateWithCustomFields> {
    return this._candidatesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @swagger.ApiDelete()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._candidatesService.remove(id, user);
  }
}
