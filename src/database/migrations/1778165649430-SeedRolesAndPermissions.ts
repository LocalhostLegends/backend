import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedRolesAndPermissions1778165649430 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const permissions = [
      // Company
      { action: 'company.read', description: 'Permission to read company' },
      { action: 'company.update', description: 'Permission to update company' },
      { action: 'company.delete', description: 'Permission to delete company' },
      // Departments
      { action: 'department.create', description: 'Permission to create department' },
      { action: 'department.read', description: 'Permission to read department' },
      { action: 'department.update', description: 'Permission to update department' },
      { action: 'department.delete', description: 'Permission to delete department' },
      // Positions
      { action: 'position.create', description: 'Permission to create position' },
      { action: 'position.read', description: 'Permission to read position' },
      { action: 'position.update', description: 'Permission to update position' },
      { action: 'position.delete', description: 'Permission to delete position' },
      // Users
      { action: 'user.create', description: 'Permission to create user' },
      { action: 'user.read', description: 'Permission to read user' },
      { action: 'user.update', description: 'Permission to update user' },
      { action: 'user.update_self', description: 'Permission to update self' },
      { action: 'user.update_email', description: 'Permission to update email' },
      { action: 'user.delete', description: 'Permission to delete user' },
      { action: 'user.manage_roles', description: 'Permission to manage roles' },
      // Invites
      { action: 'invite.create', description: 'Permission to create invite' },
      { action: 'invite.read', description: 'Permission to read invite' },
      { action: 'invite.resend', description: 'Permission to resend invite' },
      { action: 'invite.cancel', description: 'Permission to cancel invite' },
      // Jobs
      { action: 'job.create', description: 'Permission to create job' },
      { action: 'job.read', description: 'Permission to read job' },
      { action: 'job.update', description: 'Permission to update job' },
      { action: 'job.delete', description: 'Permission to delete job' },
      // Candidates
      { action: 'candidate.create', description: 'Permission to create candidate' },
      { action: 'candidate.read', description: 'Permission to read candidate' },
      { action: 'candidate.update', description: 'Permission to update candidate' },
      { action: 'candidate.delete', description: 'Permission to delete candidate' },
      // Applications
      { action: 'application.create', description: 'Permission to create application' },
      { action: 'application.read', description: 'Permission to read application' },
      { action: 'application.update_stage', description: 'Permission to update stage' },
      { action: 'application.delete', description: 'Permission to delete application' },
      // Calendar
      { action: 'calendar.create', description: 'Permission to create calendar' },
      { action: 'calendar.read', description: 'Permission to read calendar' },
      { action: 'calendar.update', description: 'Permission to update calendar' },
      { action: 'calendar.delete', description: 'Permission to delete calendar' },
      // Tasks
      { action: 'task.create', description: 'Permission to create task' },
      { action: 'task.read', description: 'Permission to read task' },
      { action: 'task.update', description: 'Permission to update task' },
      { action: 'task.update_stage', description: 'Permission to update stage' },
      { action: 'task.delete', description: 'Permission to delete task' },
      // Payroll
      { action: 'payroll.read', description: 'Permission to read payroll data' },
      { action: 'payroll.manage', description: 'Permission to manage salaries and periods' },
      { action: 'payroll.approve', description: 'Permission to approve bonuses and payroll' },
      { action: 'payroll.export', description: 'Permission to export payroll data' },
      // Salary Revision Requests
      {
        action: 'salary_revision.create',
        description: 'Permission to create salary revision request',
      },
      {
        action: 'salary_revision.read_self',
        description: 'Permission to read own salary revision requests',
      },
      {
        action: 'salary_revision.manage',
        description: 'Permission to manage salary revision requests',
      },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `INSERT INTO "permissions" (action, description) VALUES ($1, $2) ON CONFLICT (action) DO NOTHING`,
        [p.action, p.description],
      );
    }

    const roles = [
      { name: 'Super Admin', code: 'super_admin' },
      { name: 'Admin', code: 'admin' },
      { name: 'HR Manager', code: 'hr' },
      { name: 'Department Manager', code: 'manager' },
      { name: 'Employee', code: 'employee' },
    ];

    for (const r of roles) {
      await queryRunner.query(
        `INSERT INTO "roles" (name, code, is_system) VALUES ($1, $2, true) ON CONFLICT (code) DO NOTHING`,
        [r.name, r.code],
      );
    }

    // role_permissions
    // Super Admin & Admin - All permissions
    await queryRunner.query(`
      INSERT INTO "role_permissions" (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.code IN ('super_admin', 'admin')
      ON CONFLICT DO NOTHING
    `);

    const hrPermissions = [
      'user.read',
      'user.create',
      'user.update',
      'user.update_self',
      'user.manage_roles',
      'user.delete',
      'invite.create',
      'invite.read',
      'invite.resend',
      'invite.cancel',
      'job.create',
      'job.read',
      'job.update',
      'job.delete',
      'candidate.create',
      'candidate.read',
      'candidate.update',
      'candidate.delete',
      'application.create',
      'application.read',
      'application.update_stage',
      'application.delete',
      'department.create',
      'department.read',
      'department.update',
      'department.delete',
      'position.create',
      'position.read',
      'position.update',
      'position.delete',
      'task.create',
      'task.read',
      'task.update',
      'task.update_stage',
      'task.delete',
      'calendar.create',
      'calendar.read',
      'calendar.update',
      'calendar.delete',
      'payroll.read',
      'payroll.manage',
      'payroll.approve',
      'payroll.export',
      'salary_revision.create',
      'salary_revision.read_self',
      'salary_revision.manage',
    ];
    for (const p of hrPermissions) {
      await queryRunner.query(
        `
        INSERT INTO "role_permissions" (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.code = 'hr' AND p.action = $1
        ON CONFLICT DO NOTHING
      `,
        [p],
      );
    }

    const managerPermissions = [
      'user.read',
      'user.update_self',
      'department.read',
      'position.read',
      'job.create',
      'job.read',
      'job.update',
      'candidate.create',
      'candidate.read',
      'candidate.update',
      'application.create',
      'application.read',
      'application.update_stage',
      'task.create',
      'task.read',
      'task.update',
      'task.update_stage',
      'task.delete',
      'calendar.create',
      'calendar.read',
      'calendar.update',
      'calendar.delete',
      'payroll.read',
      'salary_revision.create',
      'salary_revision.read_self',
      'salary_revision.manage',
    ];
    for (const p of managerPermissions) {
      await queryRunner.query(
        `
        INSERT INTO "role_permissions" (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.code = 'manager' AND p.action = $1
        ON CONFLICT DO NOTHING
      `,
        [p],
      );
    }

    const employeePermissions = [
      'user.read',
      'user.update_self',
      'task.create',
      'task.read',
      'task.update',
      'task.update_stage',
      'task.delete',
      'calendar.create',
      'calendar.read',
      'calendar.update',
      'calendar.delete',
      'salary_revision.create',
      'salary_revision.read_self',
    ];
    for (const p of employeePermissions) {
      await queryRunner.query(
        `
        INSERT INTO "role_permissions" (role_id, permission_id)
        SELECT r.id, p.id FROM roles r, permissions p
        WHERE r.code = 'employee' AND p.action = $1
        ON CONFLICT DO NOTHING
      `,
        [p],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions"`);
    await queryRunner.query(`DELETE FROM "roles" WHERE is_system = true`);
    await queryRunner.query(`DELETE FROM "permissions"`);
  }
}
