export const ErrorMessages = {
  // User errors
  USER_NOT_FOUND: 'User not found',
  USER_NOT_ACTIVE: 'User account is not active',
  USER_INVITED: 'User account has been invited',
  USER_BLOCKED: 'User account has been blocked',
  USER_DELETED: 'User account has been deleted',
  USER_WITH_ID_NOT_FOUND: (id: string) => `User with id "${id}" not found`,
  USER_EMAIL_EXISTS: (email: string) => `User with email "${email}" already exists`,
  USER_EMAIL_EXISTS_AND_ACTIVE: (email: string) =>
    `User with email "${email}" already exists and active`,
  USER_EMAIL_EXISTS_AND_INVITED: (email: string) =>
    `User with email "${email}" already exists and invited`,

  // Department errors
  DEPARTMENT_NOT_FOUND: (id: string) => `Department with id "${id}" not found`,
  DEPARTMENT_NAME_EXISTS: (name: string) => `Department with name "${name}" already exists`,

  // Position errors
  POSITION_NOT_FOUND: (id: string) => `Position with id "${id}" not found`,
  POSITION_TITLE_EXISTS: (title: string) => `Position with title "${title}" already exists`,

  // Company errors
  COMPANY_NOT_FOUND: 'Company not found',
  COMPANY_WITH_ID_NOT_FOUND: (id: string) => `Company with id "${id}" not found`,

  // Auth errors
  INVALID_CREDENTIALS: 'Invalid credentials',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  HAS_ADMIN: 'System already has an admin',
  FORBIDDEN_CREATE_HR: 'Only ADMIN can create HR users',
  FORBIDDEN_CREATE_EMPLOYEE: 'Only ADMIN or HR can create employee users',
  FORBIDDEN_NON_OWNERSHIP_ACCESS: (resourceName: string) =>
    `This endpoint requires ownership of ${resourceName}`,
  FORBIDDEN_RESOURCE_ACCESS: (requiredRole: string, isOwnerable: boolean = true) =>
    `This endpoint requires ${requiredRole} role ${isOwnerable ? ' or ownership of the resource' : ''}`,

  // Invite errors
  INVITE_NOT_FOUND: 'Invite not found',
  INVITE_HAS_EXPIRED: 'Invite has expired',
  INVALID_INVITE_TOKEN: 'Invalid invite token',
  FORBIDDEN_INVITE_ADMIN: 'Cannot invite ADMIN users',
  FORBIDDEN_RESEND_INVITE: (status: string) => `Cannot resend ${status} invite`,
  FORBIDDEN_CANCEL_INVITE: (status: string) => `Cannot cancel ${status} invite`,
  ACTIVE_INVITE_EXISTS: (email: string) => `An active invite already exists for email $${email}`,
  INVITE_STATUS: (status: string) => `Invite is already ${status}`,

  // Validation errors
  INVALID_ID: 'Invalid ID format',
  INVALID_EMAIL: 'Invalid email format',

  // General errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Invalid request',
} as const;
