import {
  ApiDepartmentTags,
  ApiCreateDepartment,
  ApiFindAllDepartments,
  ApiFindOneDepartment,
  ApiUpdateDepartment,
  ApiRemoveDepartment,
} from './departments.decorators';
import { DepartmentFields } from './department.fields';

export const swagger = {
  ApiTags: ApiDepartmentTags,
  ApiCreate: ApiCreateDepartment,
  ApiFindAll: ApiFindAllDepartments,
  ApiFindOne: ApiFindOneDepartment,
  ApiUpdate: ApiUpdateDepartment,
  ApiRemove: ApiRemoveDepartment,
};

export { DepartmentFields };
