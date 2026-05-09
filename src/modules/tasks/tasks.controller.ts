import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';

import { TasksService, TaskWithCustomFields } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto, GetTasksQueryDto } from './dto/task.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('tasks')
export class TasksController {
  constructor(private readonly _tasksService: TasksService) {}

  @Post()
  @swagger.ApiCreate()
  create(
    @Body() createDto: CreateTaskDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.create(createDto, user);
  }

  @Get()
  @swagger.ApiGetAll()
  findAll(
    @CurrentUser() user: AuthorizedUser,
    @Query() query: GetTasksQueryDto,
  ): Promise<TaskWithCustomFields[]> {
    return this._tasksService.findAll(user, query);
  }

  @Get(':id')
  @swagger.ApiGetOne()
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.findOne(id, user);
  }

  @Patch(':id')
  @swagger.ApiUpdate()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.update(id, updateDto, user);
  }

  @Patch(':id/stage')
  @swagger.ApiUpdateStage()
  updateStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskStageDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<TaskWithCustomFields> {
    return this._tasksService.updateStage(id, updateDto, user);
  }

  @Delete(':id')
  @swagger.ApiDelete()
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._tasksService.remove(id, user);
  }
}
