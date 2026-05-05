import { ExceptionCode } from './exception-codes';

export type ExceptionParams = {
  // Users
  [ExceptionCode.USER_NOT_FOUND]: [];
  [ExceptionCode.USER_WITH_ID_NOT_FOUND]: [id: string];
  [ExceptionCode.USER_EMAIL_EXISTS]: [email: string];
  [ExceptionCode.USER_EMAIL_EXISTS_AND_ACTIVE]: [email: string];
  [ExceptionCode.USER_EMAIL_EXISTS_AND_INVITED]: [email: string];
  [ExceptionCode.USER_NOT_ACTIVE]: [];
  [ExceptionCode.USER_INVITED]: [];
  [ExceptionCode.USER_BLOCKED]: [];
  [ExceptionCode.USER_DELETED]: [];

  // Departments
  [ExceptionCode.DEPARTMENT_NOT_FOUND]: [id: string];
  [ExceptionCode.DEPARTMENT_NAME_EXISTS]: [name: string];
  [ExceptionCode.DEPARTMENT_NOT_IN_COMPANY]: [departmentId: string, companyId: string];

  // Positions
  [ExceptionCode.POSITION_NOT_FOUND]: [id: string];
  [ExceptionCode.POSITION_TITLE_EXISTS]: [title: string];
  [ExceptionCode.POSITION_NOT_IN_COMPANY]: [positionId: string, companyId: string];

  // Invites
  [ExceptionCode.INVITE_NOT_FOUND]: [];
  [ExceptionCode.INVITE_EXPIRED]: [];
  [ExceptionCode.INVITE_INVALID_TOKEN]: [];
  [ExceptionCode.INVITE_FORBIDDEN_ADMIN]: [];
  [ExceptionCode.INVITE_NOT_IN_COMPANY]: [inviteId: string, companyId: string];
  [ExceptionCode.INVITE_CANNOT_RESEND]: [status: string];
  [ExceptionCode.INVITE_CANNOT_CANCEL]: [status: string];
  [ExceptionCode.INVITE_ACTIVE_EXISTS]: [email: string];
  [ExceptionCode.INVITE_ALREADY_STATUS]: [status: string];

  // Auth
  [ExceptionCode.AUTH_INVALID_CREDENTIALS]: [];
  [ExceptionCode.AUTH_INVALID_TOKEN]: [];
  [ExceptionCode.AUTH_UNAUTHORIZED]: [];
  [ExceptionCode.AUTH_FORBIDDEN]: [];
  [ExceptionCode.AUTH_HAS_ADMIN]: [];
  [ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP]: [resourceName: string];
  [ExceptionCode.AUTH_FORBIDDEN_RESOURCE]: [requiredRole: string, isOwnerable?: boolean];
  [ExceptionCode.AUTH_TOKEN_EXPIRED]: [];
  [ExceptionCode.AUTH_TOKEN_USED]: [];

  // Companies
  [ExceptionCode.COMPANY_NOT_FOUND]: [];
  [ExceptionCode.COMPANY_WITH_ID_NOT_FOUND]: [id: string];
  [ExceptionCode.COMPANY_SUBDOMAIN_TAKEN]: [subdomain: string];

  // Common
  [ExceptionCode.COMMON_REQUIRED_FIELD]: [field: string];
};
