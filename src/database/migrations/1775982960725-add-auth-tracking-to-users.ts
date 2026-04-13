import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthTrackingToUsers1775982960725 implements MigrationInterface {
  name = 'AddAuthTrackingToUsers1775982960725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "failed_login_attempts" INT DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "last_failed_login_at" TIMESTAMP NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "last_login_ip" VARCHAR(255) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "last_login_user_agent" TEXT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN "last_login_at" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_user_agent"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_ip"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_failed_login_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "failed_login_attempts"`);
  }
}
