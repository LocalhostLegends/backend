import {
  ApiJobsTags,
  ApiCreateJob,
  ApiGetJobs,
  ApiGetJob,
  ApiUpdateJob,
  ApiDeleteJob,
} from './job.decorators';
import { JobFields } from './job.fields';

export const swagger = {
  ApiTags: ApiJobsTags,
  ApiCreate: ApiCreateJob,
  ApiGetAll: ApiGetJobs,
  ApiGetOne: ApiGetJob,
  ApiUpdate: ApiUpdateJob,
  ApiDelete: ApiDeleteJob,
};

export { JobFields };
