import {
  ApiPayrollTags,
  ApiGetSalary,
  ApiUpdateSalary,
  ApiGetHistory,
  ApiCreateBonus,
  ApiFindAllBonuses,
  ApiUpdateBonusStatus,
  ApiCreatePeriod,
  ApiFindAllPeriods,
  ApiGenerateRecords,
  ApiGetPeriodRecords,
  ApiGetPeriod,
  ApiGetMyPayrollHistory,
  ApiUpdatePeriodStatus,
  ApiCreateRevisionRequest,
  ApiGetMyRevisionRequests,
  ApiFindAllRevisionRequests,
  ApiReviewRevisionRequest,
} from './payroll.decorators';
import { PayrollFields } from './payroll.fields';

export const swagger = {
  ApiTags: ApiPayrollTags,
  ApiGetSalary,
  ApiUpdateSalary,
  ApiGetHistory,
  ApiCreateBonus,
  ApiFindAllBonuses,
  ApiUpdateBonusStatus,
  ApiCreatePeriod,
  ApiFindAllPeriods,
  ApiGenerateRecords,
  ApiGetPeriodRecords,
  ApiGetPeriod,
  ApiGetMyPayrollHistory,
  ApiUpdatePeriodStatus,
  ApiCreateRevisionRequest,
  ApiGetMyRevisionRequests,
  ApiFindAllRevisionRequests,
  ApiReviewRevisionRequest,
};

export { PayrollFields };
