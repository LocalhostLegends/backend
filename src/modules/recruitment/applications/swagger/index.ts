import {
  ApiApplicationsTags,
  ApiCreateApplication,
  ApiGetApplicationsByJob,
  ApiUpdateApplicationStage,
  ApiDeleteApplication,
} from './application.decorators';
import { ApplicationFields } from './application.fields';

export const swagger = {
  ApiTags: ApiApplicationsTags,
  ApiCreate: ApiCreateApplication,
  ApiGetByJob: ApiGetApplicationsByJob,
  ApiUpdateStage: ApiUpdateApplicationStage,
  ApiDelete: ApiDeleteApplication,
};

export { ApplicationFields };
