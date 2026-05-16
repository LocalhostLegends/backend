import {
  ApiLeaveTags,
  ApiCreateLeaveRequest,
  ApiFindAllLeaveRequests,
  ApiFindOneLeaveRequest,
  ApiSubmitLeaveRequest,
  ApiApproveLeaveRequest,
  ApiRejectLeaveRequest,
  ApiCancelLeaveRequest,
  ApiGetLeaveAuditLogs,
  ApiGetMyLeaveBalances,
  ApiGetEmployeeLeaveBalances,
  ApiFindAllLeaveTypes,
  ApiCreateLeaveType,
  ApiUpdateLeaveType,
} from './leave.decorators';
import { LeaveFields } from './leave.fields';

export const swagger = {
  ApiTags: ApiLeaveTags,
  ApiCreateRequest: ApiCreateLeaveRequest,
  ApiFindAllRequests: ApiFindAllLeaveRequests,
  ApiFindOneRequest: ApiFindOneLeaveRequest,
  ApiSubmitRequest: ApiSubmitLeaveRequest,
  ApiApproveRequest: ApiApproveLeaveRequest,
  ApiRejectRequest: ApiRejectLeaveRequest,
  ApiCancelRequest: ApiCancelLeaveRequest,
  ApiGetAuditLogs: ApiGetLeaveAuditLogs,
  ApiGetMyBalances: ApiGetMyLeaveBalances,
  ApiGetEmployeeBalances: ApiGetEmployeeLeaveBalances,
  ApiFindAllTypes: ApiFindAllLeaveTypes,
  ApiCreateType: ApiCreateLeaveType,
  ApiUpdateType: ApiUpdateLeaveType,
};

export { LeaveFields };
