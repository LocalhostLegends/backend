import {
  Controller,
  Get,
  Post,
  Body,
  ValidationPipe,
  HttpStatus,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { Candidate } from '@database/entities/candidate.entity';

import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';

@ApiTags('Candidates')
@ApiBearerAuth()
@Controller('candidates')
export class CandidatesController {
  constructor(private readonly _candidatesService: CandidatesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Candidate })
  async create(
    @Body(ValidationPipe) createDto: CreateCandidateDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Candidate> {
    return this._candidatesService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all candidates for the company' })
  @ApiResponse({ status: HttpStatus.OK, type: [Candidate] })
  async findAll(@CurrentUser() user: AuthorizedUser): Promise<Candidate[]> {
    return this._candidatesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by id' })
  @ApiResponse({ status: HttpStatus.OK, type: Candidate })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Candidate> {
    return this._candidatesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate' })
  @ApiResponse({ status: HttpStatus.OK, type: Candidate })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateCandidateDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Candidate> {
    return this._candidatesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete candidate' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._candidatesService.remove(id, user);
  }
}
