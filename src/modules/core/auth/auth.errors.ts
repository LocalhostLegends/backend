export const AuthErrors = {
  invalidCredentials: 'Invalid credentials',
  invalidToken: 'Invalid or expired token',
  unauthorized: 'Unauthorized access',
  forbidden: 'Access denied',
  hasAdmin: 'System already has an admin',
  forbiddenNonOwnershipAccess: (resourceName: string) =>
    `This endpoint requires ownership of ${resourceName}`,
  forbiddenResourceAccess: (requiredRole: string, isOwnerable: boolean = true) =>
    `This endpoint requires ${requiredRole} role ${isOwnerable ? ' or ownership of the resource' : ''}`,
};
