import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1775404252895 implements MigrationInterface {
  name = 'InitSchema1775404252895';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "code" character varying(50), "minSalary" numeric(10,2), "maxSalary" numeric(10,2), "gradeLevel" character varying(10), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "company_id" uuid NOT NULL, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ffe3ffebeb75f36766ce154e48" ON "positions" ("company_id", "title") `,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subdomain" character varying(100), "logoUrl" character varying(500), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "isActive" boolean NOT NULL DEFAULT true, "subscriptionPlan" character varying(50) NOT NULL DEFAULT 'free', "subscriptionExpiresAt" TIMESTAMP, "settings" jsonb NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "UQ_665e863569cb7332e624dc88c8c" UNIQUE ("subdomain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "code" character varying(20), "parentDepartmentId" uuid, "managerId" uuid, "budget" numeric(10,2), "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "company_id" uuid NOT NULL, "parent_department_id" uuid, "manager_id" uuid, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
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
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password" character varying(255), "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "status" "public"."users_status_enum" NOT NULL DEFAULT 'invited', "departmentId" uuid, "positionId" uuid, "phone" character varying(20), "avatar" character varying(500), "lastLoginAt" TIMESTAMP, "lastLoginIp" character varying(45), "failedLoginAttempts" integer NOT NULL DEFAULT '0', "lockedUntil" TIMESTAMP, "emailVerifiedAt" TIMESTAMP, "metadata" jsonb NOT NULL DEFAULT '{}', "preferences" jsonb NOT NULL DEFAULT '{}', "createdBy" uuid, "updatedBy" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "company_id" uuid NOT NULL, "department_id" uuid, "position_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
    await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_554d853741f2083faaa5794d2a" ON "users" ("departmentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_7d5b477d15c01b6b44f1b4e8cc" ON "users" ("positionId") `,
    );
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
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying(500) NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "isUsed" boolean NOT NULL DEFAULT false, "usedAt" TIMESTAMP, "usedIp" character varying(45), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_6a8ca5961656d13c16c04079dd3" UNIQUE ("token"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_28c9785f3f1506fb8d1f55e9b8" ON "tokens" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_306030d9411d291750fd115857" ON "tokens" ("user_id", "type") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_6a8ca5961656d13c16c04079dd" ON "tokens" ("token") `);
    await queryRunner.query(
      `CREATE TYPE "public"."invites_status_enum" AS ENUM('pending', 'accepted', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "token" uuid NOT NULL, "status" "public"."invites_status_enum" NOT NULL DEFAULT 'pending', "role" character varying(50) NOT NULL, "departmentId" uuid, "positionId" uuid, "expiresAt" TIMESTAMP NOT NULL, "sentCount" integer NOT NULL DEFAULT '1', "acceptedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "company_id" uuid NOT NULL, "invited_by" uuid NOT NULL, CONSTRAINT "UQ_18a9a6c85f7cc6f42ebef3b3188" UNIQUE ("token"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08583b1882195ae2674f839132" ON "invites" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_27f0490cde5a9d525c592ba963" ON "invites" ("expiresAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18a9a6c85f7cc6f42ebef3b318" ON "invites" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16a47ec5cba5f23750f5d1f89c" ON "invites" ("email", "company_id", "status") `,
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
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_6e727f063d839c0090364ea95f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_767f1a9880aab5cdaa0634121ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "positions" DROP CONSTRAINT "FK_6844c44333df4976bc4db69aec8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_16a47ec5cba5f23750f5d1f89c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_18a9a6c85f7cc6f42ebef3b318"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_27f0490cde5a9d525c592ba963"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_08583b1882195ae2674f839132"`);
    await queryRunner.query(`DROP TABLE "invites"`);
    await queryRunner.query(`DROP TYPE "public"."invites_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6a8ca5961656d13c16c04079dd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_306030d9411d291750fd115857"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_28c9785f3f1506fb8d1f55e9b8"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72425d1279a7db35f9b6918167"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13af76739939fc5cb3c90ab3e7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c0475460359b3d4b88bcf5cf76"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9b9c040d8c37e2a1edebb72fb5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7d5b477d15c01b6b44f1b4e8cc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_554d853741f2083faaa5794d2a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_924267c09f9e6d7d8302173d41"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dacbb3eb4f095e29372ff8e13"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ffe3ffebeb75f36766ce154e48"`);
    await queryRunner.query(`DROP TABLE "positions"`);
  }
}
