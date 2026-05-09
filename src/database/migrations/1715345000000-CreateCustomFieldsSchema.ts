import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCustomFieldsSchema1715345000000 implements MigrationInterface {
  name = 'CreateCustomFieldsSchema1715345000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_type_enum" AS ENUM('string', 'number', 'date', 'boolean', 'enum', 'entity_ref', 'multi_ref')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_values_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application')`,
    );

    await queryRunner.query(
      `CREATE TABLE "custom_field_definitions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entity_type" "public"."custom_field_definitions_entity_type_enum" NOT NULL,
        "key" character varying(100) NOT NULL,
        "label" character varying(255) NOT NULL,
        "type" "public"."custom_field_definitions_type_enum" NOT NULL,
        "options" jsonb,
        "ref_entity_type" "public"."custom_field_definitions_entity_type_enum",
        "is_required" boolean NOT NULL DEFAULT false,
        "is_filterable" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "company_id" uuid NOT NULL,
        CONSTRAINT "PK_custom_field_definitions" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE TABLE "custom_field_values" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "entity_type" "public"."custom_field_values_entity_type_enum" NOT NULL,
        "entity_id" uuid NOT NULL,
        "value_text" text,
        "value_number" numeric(20,4),
        "value_bool" boolean,
        "value_date" TIMESTAMP,
        "value_entity_id" uuid,
        "value_entity_type" "public"."custom_field_values_entity_type_enum",
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "field_id" uuid NOT NULL,
        CONSTRAINT "PK_custom_field_values" PRIMARY KEY ("id")
      )`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_cf_def_company_entity_key" ON "custom_field_definitions" ("company_id", "entity_type", "key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf_val_entity" ON "custom_field_values" ("entity_type", "entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf_val_field_text" ON "custom_field_values" ("field_id", "value_text") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf_val_field_number" ON "custom_field_values" ("field_id", "value_number") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf_val_field_date" ON "custom_field_values" ("field_id", "value_date") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf_val_entity_ref" ON "custom_field_values" ("value_entity_type", "value_entity_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" ADD CONSTRAINT "FK_cf_def_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_values" ADD CONSTRAINT "FK_cf_val_field" FOREIGN KEY ("field_id") REFERENCES "custom_field_definitions"("id") ON DELETE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "custom_field_values" DROP CONSTRAINT "FK_cf_val_field"`);
    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" DROP CONSTRAINT "FK_cf_def_company"`,
    );

    await queryRunner.query(`DROP TABLE "custom_field_values"`);
    await queryRunner.query(`DROP TABLE "custom_field_definitions"`);

    await queryRunner.query(`DROP TYPE "public"."custom_field_values_entity_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."custom_field_definitions_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."custom_field_definitions_entity_type_enum"`);
  }
}
