import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSoftDeleteToUsers1774906702037 implements MigrationInterface {
  name = 'AddSoftDeleteToUsers1774906702037';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "deleted_at" TIMESTAMP DEFAULT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "deleted_at"`,
    );
  }
}