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

import { ApplicationsService, ApplicationWithCustomFields } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStageDto } from './dto/application.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly _applicationsService: ApplicationsService) {}

  @Post()
  @swagger.ApiCreate()
  async create(
    @Body(ValidationPipe) createDto: CreateApplicationDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<ApplicationWithCustomFields> {
    return this._applicationsService.create(createDto, user);
  }

  @Get('by-job/:jobId')
  @swagger.ApiGetByJob()
  async findByJob(
    @Param('jobId', ParseUUIDPipe) jobId: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<ApplicationWithCustomFields[]> {
    return this._applicationsService.findByJob(jobId, user);
  }

  @Patch(':id/stage')
  @swagger.ApiUpdateStage()
  async updateStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) updateDto: UpdateApplicationStageDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<ApplicationWithCustomFields> {
    return this._applicationsService.updateStage(id, updateDto, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @swagger.ApiDelete()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._applicationsService.remove(id, user);
  }
}
