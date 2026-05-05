import { ExceptionCode } from './exception-codes';
import { ExceptionParams } from './exception.types';

export const ExceptionMessages: {
  [K in ExceptionCode]: (...args: ExceptionParams[K]) => string;
} = {
  // Users
  [ExceptionCode.USER_NOT_FOUND]: () => 'User not found',
  [ExceptionCode.USER_WITH_ID_NOT_FOUND]: (id: string) => `User with id "${id}" not found`,
  [ExceptionCode.USER_EMAIL_EXISTS]: (email: string) => `User with email "${email}" already exists`,
  [ExceptionCode.USER_EMAIL_EXISTS_AND_ACTIVE]: (email: string) =>
    `User with email "${email}" already exists and active`,
  [ExceptionCode.USER_EMAIL_EXISTS_AND_INVITED]: (email: string) =>
    `User with email "${email}" already exists and invited`,
  [ExceptionCode.USER_NOT_ACTIVE]: () => 'User account is not active',
  [ExceptionCode.USER_INVITED]: () => 'User account has been invited',
  [ExceptionCode.USER_BLOCKED]: () => 'User account has been blocked',
  [ExceptionCode.USER_DELETED]: () => 'User account has been deleted',

  // Departments
  [ExceptionCode.DEPARTMENT_NOT_FOUND]: (id: string) => `Department with id "${id}" not found`,
  [ExceptionCode.DEPARTMENT_NAME_EXISTS]: (name: string) =>
    `Department with name "${name}" already exists`,
  [ExceptionCode.DEPARTMENT_NOT_IN_COMPANY]: (departmentId: string, companyId: string) =>
    `Department with id "${departmentId}" is not in company with id "${companyId}"`,

  // Positions
  [ExceptionCode.POSITION_NOT_FOUND]: (id: string) => `Position with id "${id}" not found`,
  [ExceptionCode.POSITION_TITLE_EXISTS]: (title: string) =>
    `Position with title "${title}" already exists`,
  [ExceptionCode.POSITION_NOT_IN_COMPANY]: (positionId: string, companyId: string) =>
    `Position with id "${positionId}" is not in company with id "${companyId}"`,

  // Invites
  [ExceptionCode.INVITE_NOT_FOUND]: () => 'Invite not found',
  [ExceptionCode.INVITE_EXPIRED]: () => 'Invite has expired',
  [ExceptionCode.INVITE_INVALID_TOKEN]: () => 'Invalid invite token',
  [ExceptionCode.INVITE_FORBIDDEN_ADMIN]: () => 'Cannot invite ADMIN users',
  [ExceptionCode.INVITE_NOT_IN_COMPANY]: (inviteId: string, companyId: string) =>
    `Invite with id "${inviteId}" is not in company with id "${companyId}"`,
  [ExceptionCode.INVITE_CANNOT_RESEND]: (status: string) => `Cannot resend ${status} invite`,
  [ExceptionCode.INVITE_CANNOT_CANCEL]: (status: string) => `Cannot cancel ${status} invite`,
  [ExceptionCode.INVITE_ACTIVE_EXISTS]: (email: string) =>
    `An active invite already exists for email $${email}`,
  [ExceptionCode.INVITE_ALREADY_STATUS]: (status: string) => `Invite is already ${status}`,

  // Auth
  [ExceptionCode.AUTH_INVALID_CREDENTIALS]: () => 'Invalid credentials',
  [ExceptionCode.AUTH_INVALID_TOKEN]: () => 'Invalid or expired token',
  [ExceptionCode.AUTH_UNAUTHORIZED]: () => 'Unauthorized access',
  [ExceptionCode.AUTH_FORBIDDEN]: () => 'Access denied',
  [ExceptionCode.AUTH_HAS_ADMIN]: () => 'System already has an admin',
  [ExceptionCode.AUTH_FORBIDDEN_NON_OWNERSHIP]: (resourceName: string) =>
    `This endpoint requires ownership of ${resourceName}`,
  [ExceptionCode.AUTH_FORBIDDEN_RESOURCE]: (requiredRole: string, isOwnerable = true) =>
    `This endpoint requires ${requiredRole} role ${isOwnerable ? ' or ownership of the resource' : ''}`,
  [ExceptionCode.AUTH_TOKEN_EXPIRED]: () => 'Token has expired',
  [ExceptionCode.AUTH_TOKEN_USED]: () => 'Token has already been used',

  // Companies
  [ExceptionCode.COMPANY_NOT_FOUND]: () => 'Company not found',
  [ExceptionCode.COMPANY_WITH_ID_NOT_FOUND]: (id: string) => `Company with id "${id}" not found`,
  [ExceptionCode.COMPANY_SUBDOMAIN_TAKEN]: (subdomain: string) =>
    `Subdomain "${subdomain}" is already taken`,

  // Common
  [ExceptionCode.COMMON_REQUIRED_FIELD]: (field: string) => `${field} is required`,
};
