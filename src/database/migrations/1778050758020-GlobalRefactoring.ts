import { MigrationInterface, QueryRunner } from 'typeorm';

export class GlobalRefactoring1778050758020 implements MigrationInterface {
  name = 'GlobalRefactoring1778050758020';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_roles_company"`);
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_permission"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_role_permissions_role"`,
    );
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_role"`);
    await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_user_roles_user"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_28c9785f3f1506fb8d1f55e9b8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_27f0490cde5a9d525c592ba963"`);
    await queryRunner.query(
      `CREATE TABLE "company_profiles" ("company_id" uuid NOT NULL, "tax_id" character varying(100), "registration_number" character varying(100), "industry" character varying(100), "website" character varying(255), "phone" character varying(50), "email" character varying(255), "employee_count" integer, "company_size" character varying(50), CONSTRAINT "PK_30228dd283a0f14486346e1db96" PRIMARY KEY ("company_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."addresses_type_enum" AS ENUM('legal', 'physical', 'postal', 'branch')`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "street" character varying(255) NOT NULL, "postal_code" character varying(20), "type" "public"."addresses_type_enum" NOT NULL DEFAULT 'legal', "company_id" uuid, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_security" ("user_id" uuid NOT NULL, "password" character varying(255), "last_login_at" TIMESTAMP, "last_login_ip" character varying(45), "last_login_user_agent" text, "failed_login_attempts" integer NOT NULL DEFAULT '0', "last_failed_login_at" TIMESTAMP, "locked_until" TIMESTAMP, "email_verified_at" TIMESTAMP, CONSTRAINT "PK_8a181d611c3325dc702a8286685" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("user_id" uuid NOT NULL, "language" character varying(10) NOT NULL DEFAULT 'en', "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "notifications" jsonb NOT NULL DEFAULT '{"email":true,"push":true}', "theme" character varying(20) NOT NULL DEFAULT 'system', "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_4ed056b9344e6f7d8d46ec4b302" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "settings"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "password"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_ip"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_user_agent"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failed_login_attempts"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_failed_login_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "locked_until"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "metadata"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "preferences"`);
    await queryRunner.query(
      `CREATE TYPE "public"."invites_role_enum" AS ENUM('super_admin', 'admin', 'hr', 'manager', 'employee')`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ALTER COLUMN "role" TYPE "public"."invites_role_enum" USING "role"::"text"::"public"."invites_role_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "company_profiles" ADD CONSTRAINT "FK_30228dd283a0f14486346e1db96" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_21b07f425d667f94949fcc07914" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_security" ADD CONSTRAINT "FK_8a181d611c3325dc702a8286685" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_2d90cb5f0c779ab72db868f9f04" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_7cabe5c9e1d6493ed1608b4d1c1" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_7cabe5c9e1d6493ed1608b4d1c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_2d90cb5f0c779ab72db868f9f04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_security" DROP CONSTRAINT "FK_8a181d611c3325dc702a8286685"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1"`);
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_21b07f425d667f94949fcc07914"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_profiles" DROP CONSTRAINT "FK_30228dd283a0f14486346e1db96"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
    await queryRunner.query(
      `ALTER TABLE "invites" ALTER COLUMN "role" TYPE character varying(50) USING "role"::"text"`,
    );
    await queryRunner.query(`DROP TYPE "public"."invites_role_enum"`);
    await queryRunner.query(`ALTER TABLE "users" ADD "preferences" jsonb NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "users" ADD "email_verified_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "locked_until" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_failed_login_at" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "failed_login_attempts" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "last_login_user_agent" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_login_ip" character varying(45)`);
    await queryRunner.query(`ALTER TABLE "users" ADD "last_login_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "users" ADD "password" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "companies" ADD "settings" jsonb NOT NULL DEFAULT '{}'`);

    await queryRunner.query(`
            UPDATE "companies"
            SET settings = jsonb_build_object(
                'taxId', cp.tax_id,
                'industry', cp.industry,
                'website', cp.website,
                'phone', cp.phone,
                'email', cp.email,
                'employeeCount', cp.employee_count,
                'companySize', cp.company_size
            )
            FROM "company_profiles" cp
            WHERE "companies".id = cp.company_id
        `);

    await queryRunner.query(`
            UPDATE "users"
            SET "password" = us.password,
                "last_login_at" = us.last_login_at,
                "last_login_ip" = us.last_login_ip,
                "last_login_user_agent" = us.last_login_user_agent,
                "failed_login_attempts" = us.failed_login_attempts,
                "last_failed_login_at" = us.last_failed_login_at,
                "locked_until" = us.locked_until,
                "email_verified_at" = us.email_verified_at
            FROM "user_security" us
            WHERE "users".id = us.user_id
        `);

    await queryRunner.query(`
            UPDATE "users"
            SET "preferences" = jsonb_build_object(
                    'language', set.language,
                    'timezone', set.timezone,
                    'notifications', set.notifications,
                    'theme', set.theme
                ),
                "metadata" = set.metadata
            FROM "user_settings" set
            WHERE "users".id = set.user_id
        `);

    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "user_security"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TYPE "public"."addresses_type_enum"`);
    await queryRunner.query(`DROP TABLE "company_profiles"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_27f0490cde5a9d525c592ba963" ON "invites" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c9785f3f1506fb8d1f55e9b8" ON "tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_user_roles_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_role" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_role_permissions_permission" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_roles_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
