export enum PermissionAction {
  // Company
  COMPANY_READ = 'company.read',
  COMPANY_UPDATE = 'company.update',
  COMPANY_DELETE = 'company.delete',

  // Departments
  DEPARTMENT_CREATE = 'department.create',
  DEPARTMENT_READ = 'department.read',
  DEPARTMENT_UPDATE = 'department.update',
  DEPARTMENT_DELETE = 'department.delete',

  // Positions
  POSITION_CREATE = 'position.create',
  POSITION_READ = 'position.read',
  POSITION_UPDATE = 'position.update',
  POSITION_DELETE = 'position.delete',

  // Users
  USER_CREATE = 'user.create',
  USER_READ = 'user.read',
  USER_UPDATE = 'user.update',
  USER_DELETE = 'user.delete',
  USER_MANAGE_ROLES = 'user.manage_roles',

  // Invites
  INVITE_CREATE = 'invite.create',
  INVITE_READ = 'invite.read',
  INVITE_RESEND = 'invite.resend',
  INVITE_CANCEL = 'invite.cancel',
}
