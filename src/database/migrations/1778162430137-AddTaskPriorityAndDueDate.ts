import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTaskPriorityAndDueDate1778162430137 implements MigrationInterface {
  name = 'AddTaskPriorityAndDueDate1778162430137';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_company"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_assignee"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_creator"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_company_stage"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_company"`);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium'`,
    );
    await queryRunner.query(`ALTER TABLE "tasks" ADD "due_date" TIMESTAMP WITH TIME ZONE`);
    await queryRunner.query(
      `CREATE INDEX "IDX_53fbfb9d05347278ea35ccb3ac" ON "tasks" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59ae04b1b1ba8ab9fdd9b84701" ON "tasks" ("company_id", "stage") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_f4cb489461bc751498a28852356" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_855d484825b715c545349212c7f" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_855d484825b715c545349212c7f"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_f4cb489461bc751498a28852356"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_59ae04b1b1ba8ab9fdd9b84701"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_53fbfb9d05347278ea35ccb3ac"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "due_date"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "priority"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`CREATE INDEX "IDX_tasks_company" ON "tasks" ("company_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_company_stage" ON "tasks" ("company_id", "stage") `,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
