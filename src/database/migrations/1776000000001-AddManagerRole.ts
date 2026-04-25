import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManagerRole1776000000001 implements MigrationInterface {
  name = 'AddManagerRole1776000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."users_role_enum" ADD VALUE IF NOT EXISTS 'manager'`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
