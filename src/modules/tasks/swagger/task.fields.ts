import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { TaskStage } from '@common/enums/task-stage.enum';
import { TaskPriority } from '@common/enums/task-priority.enum';

export const TaskFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Task ID',
  },
  title: {
    example: 'Implement task management backend',
    description: 'Task title',
  },
  description: {
    example: 'Detailed description of the task',
    description: 'Task description',
  },
  stage: {
    enum: TaskStage,
    example: TaskStage.IN_PROGRESS,
    description: 'Current stage of the task',
  },
  priority: {
    enum: TaskPriority,
    example: TaskPriority.HIGH,
    description: 'Priority of the task',
  },
  dueDate: {
    example: '2026-05-15T10:00:00Z',
    description: 'Due date for the task',
  },
  order: {
    example: 0,
    description: 'Order of the task within its stage (for Kanban)',
  },
  creatorId: {
    example: UUID_EXAMPLE,
    description: 'ID of the user who created the task',
  },
  assigneeId: {
    example: UUID_EXAMPLE,
    description: 'ID of the user assigned to the task',
  },
  departmentId: {
    example: UUID_EXAMPLE,
    description: 'ID of the department the task belongs to',
  },
} as const satisfies SwaggerFieldsMap;
