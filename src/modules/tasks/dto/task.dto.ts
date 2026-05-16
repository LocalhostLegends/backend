import {
  IsUUID,
  IsEnum,
  IsOptional,
  IsInt,
  IsString,
  MaxLength,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';
import { CustomFieldValueType } from '@modules/custom-fields/custom-fields.types';

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement task management backend' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Detailed description of the task' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStage, default: TaskStage.TODO })
  @IsEnum(TaskStage)
  @IsOptional()
  stage?: TaskStage;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-05-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'uuid-of-assignee' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: '2h' })
  @IsString()
  @IsOptional()
  estimate?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  storyPoints?: number;

  @ApiPropertyOptional({ example: 'uuid-of-sprint' })
  @IsUUID()
  @IsOptional()
  sprintId?: string;

  @ApiPropertyOptional({ example: ['backend', 'auth'] })
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}

export class GetTasksQueryDto {
  @ApiPropertyOptional({ enum: TaskStage })
  @IsEnum(TaskStage)
  @IsOptional()
  stage?: TaskStage;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: 'uuid-of-assignee' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-creator' })
  @IsUUID()
  @IsOptional()
  creatorId?: string;

  @ApiPropertyOptional({ example: 'uuid-of-department' })
  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @ApiPropertyOptional({ example: 'search term' })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ example: 100 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  limit?: number;
}

export class UpdateTaskDto {
  @ApiPropertyOptional({ example: 'Updated title' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({ example: 'Updated description' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: TaskStage })
  @IsEnum(TaskStage)
  @IsOptional()
  stage?: TaskStage;

  @ApiPropertyOptional({ enum: TaskPriority })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @ApiPropertyOptional({ example: '2026-05-15T10:00:00Z' })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({ example: 'uuid-of-assignee' })
  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({ example: '2h' })
  @IsString()
  @IsOptional()
  estimate?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsInt()
  @IsOptional()
  storyPoints?: number;

  @ApiPropertyOptional({ example: 'uuid-of-sprint' })
  @IsUUID()
  @IsOptional()
  sprintId?: string;

  @ApiPropertyOptional({ example: ['backend', 'auth'] })
  @IsString({ each: true })
  @IsOptional()
  labels?: string[];

  @ApiPropertyOptional({ description: 'Custom fields', type: 'object', additionalProperties: true })
  @IsOptional()
  customFields?: Record<string, CustomFieldValueType>;
}

export class UpdateTaskStageDto {
  @ApiProperty({ enum: TaskStage })
  @IsEnum(TaskStage)
  stage: TaskStage;

  @ApiPropertyOptional({ example: 0 })
  @IsInt()
  @IsOptional()
  order?: number;
}
