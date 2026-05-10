import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationSettingsTable1778409590877 implements MigrationInterface {
  name = 'CreateNotificationSettingsTable1778409590877';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_settings_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_notification_settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."user_notification_settings_type_enum" NOT NULL, "is_enabled" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_user_notification_settings_user_type" UNIQUE ("user_id", "type"), CONSTRAINT "PK_user_notification_settings" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_notification_settings_user_id" ON "user_notification_settings" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_user_notification_settings_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_user_notification_settings_user_id"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_notification_settings_user_id"`);
    await queryRunner.query(`DROP TABLE "user_notification_settings"`);
    await queryRunner.query(`DROP TYPE "public"."user_notification_settings_type_enum"`);
  }
}
