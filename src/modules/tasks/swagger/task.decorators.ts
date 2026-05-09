import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
  ApiQuery,
} from '@nestjs/swagger';

import { Task } from '@database/entities/task.entity';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStageDto } from '@modules/tasks/dto/task.dto';

export const ApiTasksTags = () => ApiTags('Tasks');

export const ApiCreateTask = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create a new task' }),
    ApiBody({ type: CreateTaskDto }),
    ApiResponse({ status: HttpStatus.CREATED, type: Task }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetTasks = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all company tasks with filtering' }),
    ApiQuery({ name: 'search', type: String, required: false, description: 'Search term' }),
    ApiQuery({ name: 'stage', enum: TaskStage, required: false, description: 'Filter by stage' }),
    ApiQuery({
      name: 'priority',
      enum: TaskPriority,
      required: false,
      description: 'Filter by priority',
    }),
    ApiQuery({
      name: 'assigneeId',
      type: String,
      format: 'uuid',
      required: false,
      description: 'Filter by assignee ID',
    }),
    ApiQuery({
      name: 'creatorId',
      type: String,
      format: 'uuid',
      required: false,
      description: 'Filter by creator ID',
    }),
    ApiQuery({
      name: 'departmentId',
      type: String,
      format: 'uuid',
      required: false,
      description: 'Filter by department ID',
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      description: 'Number of results to return',
    }),
    ApiResponse({ status: HttpStatus.OK, type: [Task] }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiGetTask = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get task by id' }),
    ApiParam({ name: 'id', description: 'Task ID' }),
    ApiResponse({ status: HttpStatus.OK, type: Task }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateTask = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update task details' }),
    ApiParam({ name: 'id', description: 'Task ID' }),
    ApiBody({ type: UpdateTaskDto }),
    ApiResponse({ status: HttpStatus.OK, type: Task }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input data' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiUpdateTaskStage = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update task stage (Kanban move)' }),
    ApiParam({ name: 'id', description: 'Task ID' }),
    ApiBody({ type: UpdateTaskStageDto }),
    ApiResponse({ status: HttpStatus.OK, type: Task }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' }),
    ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid stage' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};

export const ApiDeleteTask = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete task' }),
    ApiParam({ name: 'id', description: 'Task ID' }),
    ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Task deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Task not found' }),
    ApiResponse({ status: HttpStatus.FORBIDDEN, description: 'Insufficient permissions' }),
  );
};
