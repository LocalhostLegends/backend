export const ErrorMessages = {
  // User errors
  USER_NOT_FOUND: (id: string) => `User with id "${id}" not found`,
  USER_EMAIL_EXISTS: (email: string) =>
    `User with email "${email}" already exists`,

  // Department errors
  DEPARTMENT_NOT_FOUND: (id: string) => `Department with id "${id}" not found`,
  DEPARTMENT_NAME_EXISTS: (name: string) =>
    `Department with name "${name}" already exists`,

  // Position errors
  POSITION_NOT_FOUND: (id: string) => `Position with id "${id}" not found`,
  POSITION_TITLE_EXISTS: (title: string) =>
    `Position with title "${title}" already exists`,

  // Auth errors
  INVALID_CREDENTIALS: 'Invalid credentials',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access denied',
  FORBIDDEN_RESOURCE_ACCESS: (requiredRole: string) =>
    `This endpoint requires ${requiredRole} role or ownership of the resource`,

  // Validation errors
  INVALID_ID: 'Invalid ID format',
  INVALID_EMAIL: 'Invalid email format',

  // General errors
  INTERNAL_SERVER_ERROR: 'Internal server error',
  BAD_REQUEST: 'Invalid request',
} as const;
