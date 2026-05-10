import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationsTable1778406945990 implements MigrationInterface {
  name = 'CreateNotificationsTable1778406945990';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'mention')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "title" character varying(255) NOT NULL, "message" text NOT NULL, "metadata" jsonb, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_notifications" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at") `,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user_id"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
  }
}
