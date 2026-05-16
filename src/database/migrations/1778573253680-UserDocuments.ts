import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDocuments1778573253680 implements MigrationInterface {
  name = 'UserDocuments1778573253680';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_documents_category_enum" AS ENUM('identity', 'contract', 'education', 'tax', 'health', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_documents_status_enum" AS ENUM('pending', 'verified', 'rejected', 'expired')`,
    );

    await queryRunner.query(
      `CREATE TABLE "user_documents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
        "company_id" uuid NOT NULL, 
        "user_id" uuid NOT NULL, 
        "name" character varying(255) NOT NULL, 
        "file_name" character varying(255) NOT NULL, 
        "key" character varying(500) NOT NULL, 
        "category" "public"."user_documents_category_enum" NOT NULL DEFAULT 'other', 
        "status" "public"."user_documents_status_enum" NOT NULL DEFAULT 'pending', 
        "mime_type" character varying(100) NOT NULL, 
        "size" integer NOT NULL, 
        "metadata" jsonb, 
        "uploaded_by_id" uuid NOT NULL, 
        "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
        CONSTRAINT "PK_user_documents" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_user_documents_user_category" ON "user_documents" ("user_id", "category")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_documents_company_status" ON "user_documents" ("company_id", "status")`,
    );

    await queryRunner.query(
      `ALTER TABLE "user_documents" ADD CONSTRAINT "FK_user_documents_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents" ADD CONSTRAINT "FK_user_documents_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents" ADD CONSTRAINT "FK_user_documents_uploader" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_documents" DROP CONSTRAINT "FK_user_documents_uploader"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents" DROP CONSTRAINT "FK_user_documents_user"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_documents" DROP CONSTRAINT "FK_user_documents_company"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_user_documents_company_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_user_documents_user_category"`);

    await queryRunner.query(`DROP TABLE "user_documents"`);

    await queryRunner.query(`DROP TYPE "public"."user_documents_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_documents_category_enum"`);
  }
}
