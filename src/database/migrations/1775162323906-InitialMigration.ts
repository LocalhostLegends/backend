import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1775162323906 implements MigrationInterface {
    name = 'InitialMigration1775162323906'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "code" character varying(50), "company_id" uuid NOT NULL, "min_salary" numeric(10,2), "max_salary" numeric(10,2), "grade_level" character varying(10), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_6844c44333df4976bc4db69aec" ON "positions" ("company_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_ffe3ffebeb75f36766ce154e48" ON "positions" ("company_id", "title") `);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subdomain" character varying(100), "logo_url" character varying(500), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "country" character varying(100), "city" character varying(100), "address" text, "phone" character varying(20), "email" character varying(255), "website" character varying(255), "tax_id" character varying(50), "employee_count" integer NOT NULL DEFAULT '0', "is_active" boolean NOT NULL DEFAULT true, "subscription_plan" character varying(50) NOT NULL DEFAULT 'free', "subscription_expires_at" TIMESTAMP, "settings" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_665e863569cb7332e624dc88c8c" UNIQUE ("subdomain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `);
        await queryRunner.query(`CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "code" character varying(20), "company_id" uuid NOT NULL, "parent_department_id" uuid, "manager_id" uuid, "budget" numeric(10,2), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_541e3d07c93baa9cc42b149a5f" ON "departments" ("company_id") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_924267c09f9e6d7d8302173d41" ON "departments" ("company_id", "name") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('admin', 'hr', 'employee')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('INVITED', 'ACTIVE', 'BLOCKED', 'DELETED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'employee', "status" "public"."users_status_enum" NOT NULL DEFAULT 'INVITED', "email" character varying(255) NOT NULL, "password" character varying, "company_id" uuid NOT NULL, "department_id" uuid, "position_id" uuid, "phone" character varying(20), "avatar" character varying(500), "last_login_at" TIMESTAMP, "last_login_ip" character varying(45), "failed_login_attempts" integer NOT NULL DEFAULT '0', "locked_until" TIMESTAMP, "activation_token" character varying, "activation_token_expires_at" TIMESTAMP, "reset_password_token" character varying, "reset_password_expires_at" TIMESTAMP, "email_verified_at" TIMESTAMP, "preferences" jsonb, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" uuid, "updated_by" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ef2fb839248017665e5033e730" ON "users" ("first_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_0408cb491623b121499d4fa238" ON "users" ("last_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `);
        await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`CREATE INDEX "IDX_7ae6334059289559722437bcc1" ON "users" ("company_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0921d1972cf861d568f5271cd8" ON "users" ("department_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8e29a9d2f1fa57ebf1a4ce1735" ON "users" ("position_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c0475460359b3d4b88bcf5cf76" ON "users" ("company_id", "role") `);
        await queryRunner.query(`CREATE INDEX "IDX_13af76739939fc5cb3c90ab3e7" ON "users" ("company_id", "status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_72425d1279a7db35f9b6918167" ON "users" ("company_id", "email") `);
        await queryRunner.query(`ALTER TABLE "positions" ADD CONSTRAINT "FK_6844c44333df4976bc4db69aec8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2" FOREIGN KEY ("parent_department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "departments" ADD CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2"`);
        await queryRunner.query(`ALTER TABLE "departments" DROP CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb"`);
        await queryRunner.query(`ALTER TABLE "positions" DROP CONSTRAINT "FK_6844c44333df4976bc4db69aec8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_72425d1279a7db35f9b6918167"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13af76739939fc5cb3c90ab3e7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0475460359b3d4b88bcf5cf76"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8e29a9d2f1fa57ebf1a4ce1735"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0921d1972cf861d568f5271cd8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ae6334059289559722437bcc1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0408cb491623b121499d4fa238"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef2fb839248017665e5033e730"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_924267c09f9e6d7d8302173d41"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_541e3d07c93baa9cc42b149a5f"`);
        await queryRunner.query(`DROP TABLE "departments"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3dacbb3eb4f095e29372ff8e13"`);
        await queryRunner.query(`DROP TABLE "companies"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ffe3ffebeb75f36766ce154e48"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6844c44333df4976bc4db69aec"`);
        await queryRunner.query(`DROP TABLE "positions"`);
    }

}
