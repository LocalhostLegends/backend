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

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';

import { JobsService, JobWithCustomFields } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('jobs')
export class JobsController {
  constructor(private readonly _jobsService: JobsService) {}

  @Post()
  @swagger.ApiCreate()
  async create(
    @Body(ValidationPipe) createJobDto: CreateJobDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobWithCustomFields> {
    return this._jobsService.create(createJobDto, user);
  }

  @Get()
  @swagger.ApiGetAll()
  async findAll(@CurrentUser() user: AuthorizedUser): Promise<JobWithCustomFields[]> {
    return this._jobsService.findAll(user);
  }

  @Get(':id')
  @swagger.ApiGetOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobWithCustomFields> {
    return this._jobsService.findOne(id, user);
  }

  @Patch(':id')
  @swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateJobDto: UpdateJobDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobWithCustomFields> {
    return this._jobsService.update(id, updateJobDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiDelete()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._jobsService.remove(id, user);
  }
}
