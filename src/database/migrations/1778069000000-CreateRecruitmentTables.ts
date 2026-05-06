import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRecruitmentTables1778069000000 implements MigrationInterface {
  name = 'CreateRecruitmentTables1778069000000';

  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.query(
      `CREATE TYPE "jobs_status_enum" AS ENUM('draft', 'open', 'on_hold', 'closed')`,
    );
    await query_runner.query(
      `CREATE TYPE "job_applications_stage_enum" AS ENUM('applied', 'screening', 'interview', 'technical', 'offer', 'rejected', 'hired')`,
    );

    await query_runner.query(`
            CREATE TABLE "candidates" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "first_name" varchar(100) NOT NULL,
                "last_name" varchar(100) NOT NULL,
                "email" varchar(255) NOT NULL,
                "phone" varchar(20),
                "resume_url" varchar(500),
                "company_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_candidates" PRIMARY KEY ("id"),
                CONSTRAINT "FK_candidates_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE
            )
        `);
    await query_runner.query(
      `CREATE UNIQUE INDEX "IDX_candidate_company_email" ON "candidates" ("company_id", "email") WHERE deleted_at IS NULL`,
    );

    await query_runner.query(`
            CREATE TABLE "jobs" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "title" varchar(255) NOT NULL,
                "description" text,
                "requirements" text,
                "benefits" text,
                "status" "jobs_status_enum" NOT NULL DEFAULT 'draft',
                "company_id" uuid NOT NULL,
                "department_id" uuid,
                "creator_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_jobs" PRIMARY KEY ("id"),
                CONSTRAINT "FK_jobs_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_jobs_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_jobs_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id")
            )
        `);
    await query_runner.query(`CREATE INDEX "IDX_jobs_company" ON "jobs" ("company_id")`);

    await query_runner.query(`
            CREATE TABLE "job_applications" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "job_id" uuid NOT NULL,
                "candidate_id" uuid NOT NULL,
                "stage" "job_applications_stage_enum" NOT NULL DEFAULT 'applied',
                "order" int NOT NULL DEFAULT 0,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                CONSTRAINT "PK_job_applications" PRIMARY KEY ("id"),
                CONSTRAINT "FK_applications_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_applications_candidate" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE
            )
        `);
    await query_runner.query(
      `CREATE INDEX "IDX_applications_job" ON "job_applications" ("job_id")`,
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.query(`DROP TABLE "job_applications"`);
    await query_runner.query(`DROP TABLE "jobs"`);
    await query_runner.query(`DROP TABLE "candidates"`);
    await query_runner.query(`DROP TYPE "job_applications_stage_enum"`);
    await query_runner.query(`DROP TYPE "jobs_status_enum"`);
  }
}
