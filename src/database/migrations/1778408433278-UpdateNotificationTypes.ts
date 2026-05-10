import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationTypes1778408433278 implements MigrationInterface {
  name = 'UpdateNotificationTypes1778408433278';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // We use ALTER TYPE ADD VALUE which cannot be executed within a transaction in Postgres
    // But TypeORM runs migrations in transactions by default.
    // We will use the rename approach instead to be safe with TypeORM's transaction wrapping.

    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_new"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'mention')`,
    );
    // Note: this might fail if there are existing rows with the new types
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_new"`);
  }
}
