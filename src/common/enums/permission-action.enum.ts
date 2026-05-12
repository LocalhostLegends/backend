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

  // Tasks
  TASK_CREATE = 'task.create',
  TASK_READ = 'task.read',
  TASK_UPDATE = 'task.update',
  TASK_UPDATE_STAGE = 'task.update_stage',
  TASK_DELETE = 'task.delete',

  // Leave Management
  LEAVE_REQUEST_CREATE = 'leave_request.create',
  LEAVE_REQUEST_READ = 'leave_request.read',
  LEAVE_REQUEST_UPDATE = 'leave_request.update',
  LEAVE_REQUEST_DELETE = 'leave_request.delete',
  LEAVE_REQUEST_SUBMIT = 'leave_request.submit',
  LEAVE_REQUEST_APPROVE = 'leave_request.approve',
  LEAVE_REQUEST_REJECT = 'leave_request.reject',
  LEAVE_REQUEST_CANCEL = 'leave_request.cancel',

  LEAVE_TYPE_CREATE = 'leave_type.create',
  LEAVE_TYPE_READ = 'leave_type.read',
  LEAVE_TYPE_UPDATE = 'leave_type.update',
  LEAVE_TYPE_DELETE = 'leave_type.delete',

  LEAVE_BALANCE_READ = 'leave_balance.read',
  LEAVE_BALANCE_READ_ALL = 'leave_balance.read_all',

  // Payroll
  PAYROLL_READ = 'payroll.read',
  PAYROLL_READ_SELF = 'payroll.read_self',
  PAYROLL_MANAGE = 'payroll.manage',
  PAYROLL_APPROVE = 'payroll.approve',
  PAYROLL_EXPORT = 'payroll.export',

  // Salary Revision Requests
  SALARY_REVISION_CREATE = 'salary_revision.create',
  SALARY_REVISION_READ_SELF = 'salary_revision.read_self',
  SALARY_REVISION_MANAGE = 'salary_revision.manage',
}
