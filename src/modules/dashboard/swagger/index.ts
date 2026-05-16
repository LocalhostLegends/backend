import {
  ApiDashboardTags,
  ApiGetEmployeeDashboard,
  ApiGetManagerDashboard,
  ApiGetHRDashboard,
  ApiGetAdminDashboard,
} from './dashboard.decorators';
import { DashboardFields } from './dashboard.fields';

export const swagger = {
  ApiTags: ApiDashboardTags,
  ApiGetEmployee: ApiGetEmployeeDashboard,
  ApiGetManager: ApiGetManagerDashboard,
  ApiGetHR: ApiGetHRDashboard,
  ApiGetAdmin: ApiGetAdminDashboard,
};

export { DashboardFields };
