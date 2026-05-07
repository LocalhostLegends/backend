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
  USER_UPDATE_SELF = 'user.update_self',
  USER_UPDATE_EMAIL = 'user.update_email',
  USER_DELETE = 'user.delete',
  USER_MANAGE_ROLES = 'user.manage_roles',

  // Invites
  INVITE_CREATE = 'invite.create',
  INVITE_READ = 'invite.read',
  INVITE_RESEND = 'invite.resend',
  INVITE_CANCEL = 'invite.cancel',

  // Recruitment - Jobs
  JOB_CREATE = 'job.create',
  JOB_READ = 'job.read',
  JOB_UPDATE = 'job.update',
  JOB_DELETE = 'job.delete',

  // Recruitment - Candidates
  CANDIDATE_CREATE = 'candidate.create',
  CANDIDATE_READ = 'candidate.read',
  CANDIDATE_UPDATE = 'candidate.update',
  CANDIDATE_DELETE = 'candidate.delete',

  // Recruitment - Applications
  APPLICATION_CREATE = 'application.create',
  APPLICATION_READ = 'application.read',
  APPLICATION_UPDATE_STAGE = 'application.update_stage',
  APPLICATION_DELETE = 'application.delete',

  // Calendar
  CALENDAR_CREATE = 'calendar.create',
  CALENDAR_READ = 'calendar.read',
  CALENDAR_UPDATE = 'calendar.update',
  CALENDAR_DELETE = 'calendar.delete',
}
