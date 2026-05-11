import { MigrationInterface, QueryRunner } from 'typeorm';

export class LeaveManagement1778165649431 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "leave_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "default_days" numeric(5,2) NOT NULL DEFAULT '0',
        "requires_balance" boolean NOT NULL DEFAULT true,
        "color" character varying(20),
        "is_active" boolean NOT NULL DEFAULT true,
        "company_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_types" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_leave_types_code_company" ON "leave_types" ("code", "company_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE "leave_balances" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "employee_id" uuid NOT NULL,
        "leave_type_id" uuid NOT NULL,
        "total_days" numeric(5,2) NOT NULL DEFAULT '0',
        "used_days" numeric(5,2) NOT NULL DEFAULT '0',
        "remaining_days" numeric(5,2) NOT NULL DEFAULT '0',
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_balances" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_leave_balances_employee_type" ON "leave_balances" ("employee_id", "leave_type_id")`,
    );

    await queryRunner.query(`
      CREATE TYPE "leave_requests_status_enum" AS ENUM('draft', 'pending', 'approved', 'rejected', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TABLE "leave_requests" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "employee_id" uuid NOT NULL,
        "leave_type_id" uuid NOT NULL,
        "start_date" date NOT NULL,
        "end_date" date NOT NULL,
        "total_days" numeric(5,2) NOT NULL,
        "reason" text,
        "status" "leave_requests_status_enum" NOT NULL DEFAULT 'draft',
        "company_id" uuid NOT NULL,
        "approved_at" TIMESTAMP,
        "rejected_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_requests" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_employee_status" ON "leave_requests" ("employee_id", "status")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_company_status" ON "leave_requests" ("company_id", "status")`,
    );

    await queryRunner.query(`
      CREATE TYPE "leave_approvals_action_enum" AS ENUM('approved', 'rejected', 'requested_changes')
    `);
    await queryRunner.query(`
      CREATE TABLE "leave_approvals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leave_request_id" uuid NOT NULL,
        "approver_id" uuid NOT NULL,
        "action" "leave_approvals_action_enum" NOT NULL,
        "comment" text,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_approvals" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "leave_audit_logs_event_type_enum" AS ENUM('request_created', 'request_updated', 'submitted_for_approval', 'approved', 'rejected', 'cancelled')
    `);
    await queryRunner.query(`
      CREATE TABLE "leave_audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "leave_request_id" uuid NOT NULL,
        "actor_id" uuid,
        "event_type" "leave_audit_logs_event_type_enum" NOT NULL,
        "metadata" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_leave_audit_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_audit_logs_request" ON "leave_audit_logs" ("leave_request_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "leave_types" ADD CONSTRAINT "FK_leave_types_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_leave_balances_employee" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_leave_balances_type" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_employee" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_type" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_leave_approvals_request" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_leave_approvals_approver" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_leave_audit_logs_request" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_leave_audit_logs_actor" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL`,
    );

    await queryRunner.query(`ALTER TYPE "calendar_events_type_enum" ADD VALUE 'absence'`);

    const permissions = [
      { action: 'leave_request.create', description: 'Permission to create leave request' },
      { action: 'leave_request.read', description: 'Permission to read leave request' },
      { action: 'leave_request.update', description: 'Permission to update leave request' },
      { action: 'leave_request.delete', description: 'Permission to delete leave request' },
      { action: 'leave_request.submit', description: 'Permission to submit leave request' },
      { action: 'leave_request.approve', description: 'Permission to approve leave request' },
      { action: 'leave_request.reject', description: 'Permission to reject leave request' },
      { action: 'leave_request.cancel', description: 'Permission to cancel leave request' },
      { action: 'leave_type.create', description: 'Permission to create leave type' },
      { action: 'leave_type.read', description: 'Permission to read leave type' },
      { action: 'leave_type.update', description: 'Permission to update leave type' },
      { action: 'leave_type.delete', description: 'Permission to delete leave type' },
      { action: 'leave_balance.read', description: 'Permission to read own leave balance' },
      { action: 'leave_balance.read_all', description: 'Permission to read all leave balances' },
    ];

    for (const p of permissions) {
      await queryRunner.query(
        `INSERT INTO "permissions" (action, description) VALUES ($1, $2) ON CONFLICT (action) DO NOTHING`,
        [p.action, p.description],
      );
    }

    // Assign permissions to roles
    // Super Admin & Admin - All leave permissions
    await queryRunner.query(`
      INSERT INTO "role_permissions" (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.code IN ('super_admin', 'admin') AND p.action LIKE 'leave_%'
      ON CONFLICT DO NOTHING
    `);

    // HR - All leave permissions
    await queryRunner.query(`
      INSERT INTO "role_permissions" (role_id, permission_id)
      SELECT r.id, p.id FROM roles r, permissions p
      WHERE r.code = 'hr' AND p.action LIKE 'leave_%'
      ON CONFLICT DO NOTHING
    `);

    // Manager
    const managerPermissions = [
      'leave_request.create',
      'leave_request.read',
      'leave_request.submit',
      'leave_request.cancel',
      'leave_request.approve',
      'leave_request.reject',
      'leave_balance.read',
      'leave_balance.read_all',
      'leave_type.read',
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

    // Employee
    const employeePermissions = [
      'leave_request.create',
      'leave_request.read',
      'leave_request.update',
      'leave_request.submit',
      'leave_request.cancel',
      'leave_balance.read',
      'leave_type.read',
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
    await queryRunner.query(`DROP TABLE "leave_audit_logs"`);
    await queryRunner.query(`DROP TYPE "leave_audit_logs_event_type_enum"`);
    await queryRunner.query(`DROP TABLE "leave_approvals"`);
    await queryRunner.query(`DROP TYPE "leave_approvals_action_enum"`);
    await queryRunner.query(`DROP TABLE "leave_requests"`);
    await queryRunner.query(`DROP TYPE "leave_requests_status_enum"`);
    await queryRunner.query(`DROP TABLE "leave_balances"`);
    await queryRunner.query(`DROP TABLE "leave_types"`);

    await queryRunner.query(`DELETE FROM "permissions" WHERE action LIKE 'leave_%'`);
  }
}
