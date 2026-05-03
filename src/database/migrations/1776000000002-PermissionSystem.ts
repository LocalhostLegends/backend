import { MigrationInterface, QueryRunner } from 'typeorm';

export class PermissionSystemMigration1776000000002 implements MigrationInterface {
  name = 'PermissionSystemMigration1776000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD "permissions_version" integer NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "action" character varying NOT NULL,
        "description" character varying,
        CONSTRAINT "PK_permissions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_permissions_action" UNIQUE ("action")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "is_system" boolean NOT NULL DEFAULT false,
        "company_id" uuid,
        CONSTRAINT "PK_roles_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_roles_code" UNIQUE ("code"),
        CONSTRAINT "FK_roles_company"
          FOREIGN KEY ("company_id")
          REFERENCES "companies"("id")
          ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id"),
        CONSTRAINT "FK_role_permissions_role"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_role_permissions_permission"
          FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" uuid NOT NULL,
        "role_id" uuid NOT NULL,
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("user_id", "role_id"),
        CONSTRAINT "FK_user_roles_user"
          FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_roles_role"
          FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      INSERT INTO "permissions" ("action", "description") VALUES
      ('company.read', 'Read company info'),
      ('company.update', 'Update company info'),
      ('company.delete', 'Delete company'),
      ('department.create', 'Create department'),
      ('department.read', 'Read department info'),
      ('department.update', 'Update department info'),
      ('department.delete', 'Delete department'),
      ('position.create', 'Create position'),
      ('position.read', 'Read position info'),
      ('position.update', 'Update position info'),
      ('position.delete', 'Delete position'),
      ('user.create', 'Create employee'),
      ('user.read', 'Read employee info'),
      ('user.update', 'Update employee info'),
      ('user.delete', 'Delete employee'),
      ('user.manage_roles', 'Manage user roles'),
      ('invite.create', 'Create invitation'),
      ('invite.read', 'Read invitations'),
      ('invite.resend', 'Resend invitation'),
      ('invite.cancel', 'Cancel invitation')
    `);

    await queryRunner.query(`
      INSERT INTO "roles" ("name", "code", "is_system") VALUES
      ('Admin', 'admin', true),
      ('HR Manager', 'hr', true),
      ('Department Manager', 'manager', true),
      ('Employee', 'employee', true)
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code = 'admin'
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.action IN (
        'company.read',
        'department.read',
        'department.update',
        'department.delete',
        'position.read',
        'position.create',
        'position.update',
        'position.delete',
        'user.create',
        'user.read',
        'user.update',
        'user.delete',
        'user.manage_roles',
        'invite.create',
        'invite.read',
        'invite.resend',
        'invite.cancel'
      )
      WHERE r.code = 'hr'
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.action IN (
        'department.read',
        'department.update',
        'position.read',
        'user.read',
        'user.update',
        'invite.read'
      )
      WHERE r.code = 'manager'
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.action IN (
        'company.read',
        'department.read',
        'position.read',
        'user.read',
        'user.update'
      )
      WHERE r.code = 'employee'
    `);

    await queryRunner.query(`
      INSERT INTO "user_roles" ("user_id", "role_id")
      SELECT u.id, r.id
      FROM "users" u
      JOIN "roles" r ON u."role"::text = r."code"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "permissions_version"`);
  }
}
