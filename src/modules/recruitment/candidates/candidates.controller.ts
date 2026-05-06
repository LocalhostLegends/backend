import { Controller, Get, Post, Body, ValidationPipe, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { Candidate } from '@database/entities/candidate.entity';

import { CandidatesService } from './candidates.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@ApiTags('Candidates')
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
}
