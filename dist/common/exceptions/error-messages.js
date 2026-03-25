"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorMessages = void 0;
exports.ErrorMessages = {
    USER_NOT_FOUND: (id) => `User with id "${id}" not found`,
    USER_EMAIL_EXISTS: (email) => `User with email "${email}" already exists`,
    DEPARTMENT_NOT_FOUND: (id) => `Department with id "${id}" not found`,
    DEPARTMENT_NAME_EXISTS: (name) => `Department with name "${name}" already exists`,
    POSITION_NOT_FOUND: (id) => `Position with id "${id}" not found`,
    POSITION_TITLE_EXISTS: (title) => `Position with title "${title}" already exists`,
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access denied',
    FORBIDDEN_RESOURCE_ACCESS: (requiredRole) => `This endpoint requires ${requiredRole} role or ownership of the resource`,
    INVALID_ID: 'Invalid ID format',
    INVALID_EMAIL: 'Invalid email format',
    INTERNAL_SERVER_ERROR: 'Internal server error',
    BAD_REQUEST: 'Invalid request',
};
//# sourceMappingURL=error-messages.js.map