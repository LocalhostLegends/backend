import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { Job } from '@database/entities/job.entity';

import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly _jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job vacancy' })
  @ApiResponse({ status: HttpStatus.CREATED, type: Job })
  async create(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Job> {
    return this._jobsService.create(createJobDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all job vacancies for the company' })
  @ApiResponse({ status: HttpStatus.OK, type: [Job] })
  async findAll(@CurrentUser() user: AuthorizedUser): Promise<Job[]> {
    return this._jobsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job vacancy by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: Job })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Job> {
    return this._jobsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job vacancy' })
  @ApiResponse({ status: HttpStatus.OK, type: Job })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateJobDto: UpdateJobDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Job> {
    return this._jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove job vacancy' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._jobsService.remove(id, user);
  }
}
