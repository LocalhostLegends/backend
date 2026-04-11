import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserLoginAuditColumns1775903470712 implements MigrationInterface {
  name = 'AddUserLoginAuditColumns1775903470712';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "auth_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_type" character varying(100) NOT NULL, "user_id" uuid, "email_attempted" character varying(255), "ip" character varying(255), "user_agent" text, "request_id" character varying(255), "method" character varying(10), "path" character varying(500), "success" boolean NOT NULL DEFAULT false, "failure_reason" character varying(255), "enrichment_status" character varying(50) NOT NULL DEFAULT 'pending', "risk_score" integer, "suspicious" boolean, "country" character varying(100), "city" character varying(100), "browser" character varying(100), "os" character varying(100), "device_type" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be11d76bd32256469e1a14a97db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD "lastLoginUserAgent" text`);
    await queryRunner.query(`ALTER TABLE "users" ADD "lastFailedLoginAt" TIMESTAMP`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastFailedLoginAt"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastLoginUserAgent"`);
    await queryRunner.query(`DROP TABLE "auth_audit_logs"`);
  }
}
