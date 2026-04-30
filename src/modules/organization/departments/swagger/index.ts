import * as departmentDecorators from './departments.decorators';
import { DepartmentFields } from './department.fields';

export const swagger = {
  ApiTags: departmentDecorators.ApiDepartmentTags,
  ApiCreate: departmentDecorators.ApiCreateDepartment,
  ApiFindAll: departmentDecorators.ApiFindAllDepartments,
  ApiFindOne: departmentDecorators.ApiFindOneDepartment,
  ApiUpdate: departmentDecorators.ApiUpdateDepartment,
  ApiRemove: departmentDecorators.ApiRemoveDepartment,
};

export { DepartmentFields };
