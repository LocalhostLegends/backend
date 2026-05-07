import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCalendarEvents1778153868276 implements MigrationInterface {
  name = 'CreateCalendarEvents1778153868276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_creator"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_department"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_jobs_company"`);
    await queryRunner.query(`ALTER TABLE "candidates" DROP CONSTRAINT "FK_candidates_company"`);
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_applications_candidate"`,
    );
    await queryRunner.query(`ALTER TABLE "job_applications" DROP CONSTRAINT "FK_applications_job"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_jobs_company"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_candidate_company_email"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_applications_job"`);
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_events_type_enum" AS ENUM('meeting', 'work', 'hr', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "type" "public"."calendar_events_type_enum" NOT NULL DEFAULT 'other', "location" character varying(255), "attendees" integer NOT NULL DEFAULT '0', "external_id" character varying(255), "metadata" jsonb, "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16019a7604b27007ecbe9aba25" ON "calendar_events" ("external_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9da25bb67c068f2768d141f111" ON "calendar_events" ("company_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_caebc6af02e80ce51b8ebf6348" ON "calendar_events" ("user_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_087a773c50525e348e26188e7c" ON "jobs" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa8f106c019cb050738fd16527" ON "jobs" ("department_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf18ff30eda17e5d526125c963" ON "jobs" ("creator_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4889aca8e7c52f6e0d0bf9c0d8" ON "candidates" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1d29c79dffbcd4db6075fc55e3" ON "candidates" ("company_id", "email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99292c6cd0ed428e8f5b4e2295" ON "job_applications" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ed185c3d4417cc1f5ec3f28e5" ON "job_applications" ("candidate_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_fa8f106c019cb050738fd165271" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_cf18ff30eda17e5d526125c9630" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" ADD CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_7f9a3d7f6217b99b6b2431887df" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_5fd0761abe234b27e7ea941f940" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_5fd0761abe234b27e7ea941f940"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_7f9a3d7f6217b99b6b2431887df"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_cf18ff30eda17e5d526125c9630"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_fa8f106c019cb050738fd165271"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6ed185c3d4417cc1f5ec3f28e5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_99292c6cd0ed428e8f5b4e2295"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1d29c79dffbcd4db6075fc55e3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4889aca8e7c52f6e0d0bf9c0d8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf18ff30eda17e5d526125c963"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fa8f106c019cb050738fd16527"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_087a773c50525e348e26188e7c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_caebc6af02e80ce51b8ebf6348"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9da25bb67c068f2768d141f111"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_16019a7604b27007ecbe9aba25"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_events_type_enum"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_applications_job" ON "job_applications" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_candidate_company_email" ON "candidates" ("company_id", "email") WHERE (deleted_at IS NULL)`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_jobs_company" ON "jobs" ("company_id") `);
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_applications_job" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_applications_candidate" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" ADD CONSTRAINT "FK_candidates_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_jobs_creator" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
