import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1776000000000 implements MigrationInterface {
  name = 'InitialSchema1776000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subdomain" character varying(100), "logo_url" character varying(500), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "is_active" boolean NOT NULL DEFAULT true, "subscription_plan" character varying(50) NOT NULL DEFAULT 'free', "subscription_expires_at" TIMESTAMP, "settings" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_665e863569cb7332e624dc88c8c" UNIQUE ("subdomain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `,
    );

    await queryRunner.query(
      `CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "code" character varying(50), "min_salary" numeric(10,2), "max_salary" numeric(10,2), "grade_level" character varying(10), "is_active" boolean NOT NULL DEFAULT true, "company_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ffe3ffebeb75f36766ce154e48" ON "positions" ("company_id", "title") `,
    );

    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "code" character varying(20), "budget" numeric(10,2), "is_active" boolean NOT NULL DEFAULT true, "company_id" uuid NOT NULL, "parent_department_id" uuid, "manager_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_924267c09f9e6d7d8302173d41" ON "departments" ("company_id", "name") `,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('super_admin', 'admin', 'hr', 'employee')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('invited', 'active', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255), "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "status" "public"."users_status_enum" NOT NULL DEFAULT 'invited', "company_id" uuid NOT NULL, "department_id" uuid, "position_id" uuid, "phone" character varying(20), "avatar" character varying(500), "last_login_at" TIMESTAMP, "last_login_ip" character varying(45), "last_login_user_agent" text, "failed_login_attempts" integer NOT NULL DEFAULT 0, "last_failed_login_at" TIMESTAMP, "locked_until" TIMESTAMP, "email_verified_at" TIMESTAMP, "metadata" jsonb NOT NULL DEFAULT '{}', "preferences" jsonb NOT NULL DEFAULT '{}', "created_by" uuid, "updated_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
    await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_9b9c040d8c37e2a1edebb72fb5" ON "users" ("email", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c0475460359b3d4b88bcf5cf76" ON "users" ("company_id", "role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13af76739939fc5cb3c90ab3e7" ON "users" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_72425d1279a7db35f9b6918167" ON "users" ("company_id", "email") `,
    );

    await queryRunner.query(
      `CREATE TYPE "public"."tokens_type_enum" AS ENUM('activation', 'reset_password', 'magic_link')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying(500) NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, "user_id" uuid, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" TIMESTAMP, "used_ip" character varying(45), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a8ca5961656d13c16c04079dd3" UNIQUE ("token"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c9785f3f1506fb8d1f55e9b8" ON "tokens" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_306030d9411d291750fd115857" ON "tokens" ("user_id", "type") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_6a8ca5961656d13c16c04079dd" ON "tokens" ("token") `);

    await queryRunner.query(
      `CREATE TYPE "public"."invites_status_enum" AS ENUM('pending', 'accepted', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "token" uuid NOT NULL, "status" "public"."invites_status_enum" NOT NULL DEFAULT 'pending', "role" character varying(50) NOT NULL, "company_id" uuid NOT NULL, "invited_by" uuid NOT NULL, "department_id" uuid, "position_id" uuid, "expires_at" TIMESTAMP NOT NULL, "sent_count" integer NOT NULL DEFAULT 1, "accepted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_18a9a6c85f7cc6f42ebef3b3188" UNIQUE ("token"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08583b1882195ae2674f839132" ON "invites" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27f0490cde5a9d525c592ba963" ON "invites" ("expires_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18a9a6c85f7cc6f42ebef3b318" ON "invites" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16a47ec5cba5f23750f5d1f89c" ON "invites" ("email", "company_id", "status") `,
    );

    await queryRunner.query(
      `CREATE TABLE "auth_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_type" character varying(100) NOT NULL, "user_id" uuid, "email_attempted" character varying(255), "ip" character varying(255), "user_agent" text, "request_id" character varying(255), "method" character varying(10), "path" character varying(500), "success" boolean NOT NULL DEFAULT false, "failure_reason" character varying(255), "enrichment_status" character varying(50) NOT NULL DEFAULT 'pending', "risk_score" integer, "suspicious" boolean, "country" character varying(100), "city" character varying(100), "browser" character varying(100), "os" character varying(100), "device_type" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be11d76bd32256469e1a14a97db" PRIMARY KEY ("id"))`,
    );

    await queryRunner.query(
      `ALTER TABLE "positions" ADD CONSTRAINT "FK_6844c44333df4976bc4db69aec8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2" FOREIGN KEY ("parent_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_767f1a9880aab5cdaa0634121ab" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_6e727f063d839c0090364ea95f3" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "auth_audit_logs" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "invites" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tokens" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "departments" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "positions" CASCADE`);
    await queryRunner.query(`DROP TABLE IF EXISTS "companies" CASCADE`);

    await queryRunner.query(`DROP TYPE IF EXISTS "public"."invites_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."tokens_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."users_role_enum"`);
  }
}
