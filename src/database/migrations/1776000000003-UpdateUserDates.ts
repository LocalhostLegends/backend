import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateUserDates1776000000003 implements MigrationInterface {
  name = 'UpdateUserDates1776000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "date_of_birth" date
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "hire_date" date
    `);

    await queryRunner.query(`
      UPDATE "users" SET "hire_date" = CURRENT_DATE WHERE "hire_date" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users" ALTER COLUMN "hire_date" SET NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "hire_date"
    `);

    await queryRunner.query(`
      ALTER TABLE "users" DROP COLUMN IF EXISTS "date_of_birth"
    `);
  }
}
