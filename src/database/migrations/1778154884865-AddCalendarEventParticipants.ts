import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalendarEventParticipants1778154884865 implements MigrationInterface {
  name = 'AddCalendarEventParticipants1778154884865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."calendar_event_participants_status_enum" AS ENUM('pending', 'accepted', 'declined')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_event_participants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_id" uuid NOT NULL, "user_id" uuid NOT NULL, "status" "public"."calendar_event_participants_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_95b67cff446d9606902865f7cd3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_f7bb0b6a6d4f1f5775ed44fd7c" ON "calendar_event_participants" ("event_id", "user_id") `,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_events" RENAME COLUMN "user_id" TO "organizer_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_7f9a3d7f6217b99b6b2431887df"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_caebc6af02e80ce51b8ebf6348"`);

    await queryRunner.query(`ALTER TABLE "calendar_events" ADD "candidate_id" uuid`);
    await queryRunner.query(`ALTER TABLE "calendar_events" ADD "vacancy_id" uuid`);

    await queryRunner.query(`
            INSERT INTO "calendar_event_participants" (event_id, user_id, status)
            SELECT id, organizer_id, 'accepted'
            FROM "calendar_events"
        `);

    await queryRunner.query(
      `CREATE INDEX "IDX_1245851ef2622aec6b28254832" ON "calendar_events" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_511b6b534664db545ca5398526" ON "calendar_events" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0faaccf592164e141b2742ed07" ON "calendar_events" ("vacancy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2197538732f5c3f6bdff2426f" ON "calendar_events" ("organizer_id", "start_time") `,
    );

    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" ADD CONSTRAINT "FK_7fb36ee98417604477e47a6310c" FOREIGN KEY ("event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" ADD CONSTRAINT "FK_c3290346db85ab981a0ccd26888" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_b96ca56f0f09bc960647dd5a335" FOREIGN KEY ("organizer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_b96ca56f0f09bc960647dd5a335"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" DROP CONSTRAINT "FK_c3290346db85ab981a0ccd26888"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" DROP CONSTRAINT "FK_7fb36ee98417604477e47a6310c"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_d2197538732f5c3f6bdff2426f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0faaccf592164e141b2742ed07"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_511b6b534664db545ca5398526"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1245851ef2622aec6b28254832"`);

    await queryRunner.query(`ALTER TABLE "calendar_events" DROP COLUMN "vacancy_id"`);
    await queryRunner.query(`ALTER TABLE "calendar_events" DROP COLUMN "candidate_id"`);

    await queryRunner.query(
      `ALTER TABLE "calendar_events" RENAME COLUMN "organizer_id" TO "user_id"`,
    );

    await queryRunner.query(`DROP INDEX "public"."IDX_f7bb0b6a6d4f1f5775ed44fd7c"`);
    await queryRunner.query(`DROP TABLE "calendar_event_participants"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_event_participants_status_enum"`);

    await queryRunner.query(
      `CREATE INDEX "IDX_caebc6af02e80ce51b8ebf6348" ON "calendar_events" ("start_time", "user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_7f9a3d7f6217b99b6b2431887df" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
