import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { Task } from '@database/entities/task.entity';

import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto } from './dto/task.dto';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksController {
  constructor(private readonly _tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@Body() createDto: CreateTaskDto, @CurrentUser() user: AuthorizedUser): Promise<Task> {
    return this._tasksService.create(createDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all company tasks' })
  findAll(@CurrentUser() user: AuthorizedUser): Promise<Task[]> {
    return this._tasksService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by id' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Task> {
    return this._tasksService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task details' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Task> {
    return this._tasksService.update(id, updateDto, user);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Update task stage (Kanban move)' })
  updateStage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTaskStageDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<Task> {
    return this._tasksService.updateStage(id, updateDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._tasksService.remove(id, user);
  }
}
