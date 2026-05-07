import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTasksTable1778155000000 implements MigrationInterface {
  name = 'CreateTasksTable1778155000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tasks_stage_enum" AS ENUM(
        'backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "description" text,
        "stage" "tasks_stage_enum" NOT NULL DEFAULT 'todo',
        "order" integer NOT NULL DEFAULT 0,
        "creator_id" uuid NOT NULL,
        "assignee_id" uuid,
        "company_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        CONSTRAINT "PK_tasks_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_tasks_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_assignee" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION,
        CONSTRAINT "FK_tasks_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_company_stage" ON "tasks" ("company_id", "stage")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_tasks_company" ON "tasks" ("company_id")`);

    // Grant Permissions
    await queryRunner.query(`
      INSERT INTO "permissions" ("action", "description") VALUES
      ('task.create', 'Create company tasks'),
      ('task.read', 'Read company tasks'),
      ('task.update', 'Update company tasks'),
      ('task.update_stage', 'Update task stage (Kanban move)'),
      ('task.delete', 'Delete company tasks')
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code IN ('admin', 'hr', 'manager', 'employee')
      AND p.action LIKE 'task.%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE action LIKE 'task.%'
      )
    `);

    await queryRunner.query(`
      DELETE FROM permissions 
      WHERE action LIKE 'task.%'
    `);

    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "tasks_stage_enum"`);
  }
}
