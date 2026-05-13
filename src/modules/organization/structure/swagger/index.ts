import {
  ApiStructureTags,
  ApiGetFullTree,
  ApiGetDepartmentTree,
  ApiGetEmployeeContext,
} from './structure.decorators';
import { StructureFields } from './structure.fields';

export const swagger = {
  ApiTags: ApiStructureTags,
  ApiGetFullTree: ApiGetFullTree,
  ApiGetDepartmentTree: ApiGetDepartmentTree,
  ApiGetEmployeeContext: ApiGetEmployeeContext,
};

export { StructureFields };
