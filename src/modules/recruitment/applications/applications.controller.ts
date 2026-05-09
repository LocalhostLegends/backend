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
import { JobApplication } from '@database/entities/job-application.entity';

import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStageDto } from './dto/application.dto';

@ApiTags('Job Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly _applicationsService: ApplicationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiResponse({ status: HttpStatus.CREATED, type: JobApplication })
  async create(
    @Body(ValidationPipe) createDto: CreateApplicationDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobApplication> {
    return this._applicationsService.create(createDto, user);
  }

  @Get('by-job/:jobId')
  @ApiOperation({ summary: 'Get all applications for a specific job (Kanban board data)' })
  @ApiResponse({ status: HttpStatus.OK, type: [JobApplication] })
  async findByJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobApplication[]> {
    return this._applicationsService.findByJob(jobId, user);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update application stage (Kanban move)' })
  @ApiResponse({ status: HttpStatus.OK, type: JobApplication })
  async updateStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateApplicationStageDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<JobApplication> {
    return this._applicationsService.updateStage(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove application' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._applicationsService.remove(id, user);
  }
}
