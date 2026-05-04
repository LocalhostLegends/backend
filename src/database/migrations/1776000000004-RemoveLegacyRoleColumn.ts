import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLegacyRoleColumn1776000000004 implements MigrationInterface {
  name = 'RemoveLegacyRoleColumn1776000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_ace513fa30d485cfd25c11a9e4"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_c0475460359b3d4b88bcf5cf76"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "role"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'hr', 'manager', 'employee')`,
    );

    await queryRunner.query(
      `ALTER TABLE "users" ADD "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee'`,
    );

    await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_c0475460359b3d4b88bcf5cf76" ON "users" ("company_id", "role")`,
    );

    await queryRunner.query(`
      UPDATE "users" u
      SET "role" = r.code::"public"."users_role_enum"
      FROM "user_roles" ur
      JOIN "roles" r ON r.id = ur.role_id
      WHERE ur.user_id = u.id
    `);
  }
}
