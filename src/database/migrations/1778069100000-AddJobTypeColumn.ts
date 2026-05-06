import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddJobTypeColumn1778069100000 implements MigrationInterface {
  name = 'AddJobTypeColumn1778069100000';

  public async up(query_runner: QueryRunner): Promise<void> {
    await query_runner.query(
      `CREATE TYPE "jobs_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship')`,
    );
    await query_runner.query(
      `ALTER TABLE "jobs" ADD "type" "jobs_type_enum" NOT NULL DEFAULT 'full_time'`,
    );
  }

  public async down(query_runner: QueryRunner): Promise<void> {
    await query_runner.query(`ALTER TABLE "jobs" DROP COLUMN "type"`);
    await query_runner.query(`DROP TYPE "jobs_type_enum"`);
  }
}
