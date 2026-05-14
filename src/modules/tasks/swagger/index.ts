import {
  ApiTasksTags,
  ApiCreateTask,
  ApiGetTasks,
  ApiExportTasksCsv,
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
  ApiExportCsv: ApiExportTasksCsv,
  ApiGetOne: ApiGetTask,
  ApiUpdate: ApiUpdateTask,
  ApiUpdateStage: ApiUpdateTaskStage,
  ApiDelete: ApiDeleteTask,
};

export { TaskFields };
