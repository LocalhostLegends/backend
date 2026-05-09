import {
  ApiTasksTags,
  ApiCreateTask,
  ApiGetTasks,
  ApiGetTask,
  ApiUpdateTask,
  ApiUpdateTaskStage,
  ApiDeleteTask,
} from './task.decorators';
import { TaskFields } from './task.fields';

export const swagger = {
  ApiTags: ApiTasksTags,
  ApiCreate: ApiCreateTask,
  ApiGetAll: ApiGetTasks,
  ApiGetOne: ApiGetTask,
  ApiUpdate: ApiUpdateTask,
  ApiUpdateStage: ApiUpdateTaskStage,
  ApiDelete: ApiDeleteTask,
};

export { TaskFields };
