"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserSchema1774093870715 = void 0;
class UpdateUserSchema1774093870715 {
    async up(queryRunner) {
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'users_role_enum') THEN
                    CREATE TYPE "users_role_enum" AS ENUM ('admin', 'manager', 'employee');
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "users" 
            ADD COLUMN IF NOT EXISTS "first_name" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "last_name" VARCHAR(100),
            ADD COLUMN IF NOT EXISTS "role" "users_role_enum" DEFAULT 'employee',
            ADD COLUMN IF NOT EXISTS "password" VARCHAR(255)
        `);
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='name') THEN
                    UPDATE "users" 
                    SET "first_name" = "name" 
                    WHERE "first_name" IS NULL AND "name" IS NOT NULL;
                END IF;
            END $$;
        `);
        await queryRunner.query(`
            ALTER TABLE "users" 
            ALTER COLUMN "first_name" SET NOT NULL,
            ALTER COLUMN "last_name" SET NOT NULL,
            ALTER COLUMN "password" SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN IF EXISTS "name"
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "name" VARCHAR(100)
        `);
        await queryRunner.query(`
            UPDATE "users" SET "name" = "first_name" WHERE "name" IS NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users" 
            DROP COLUMN IF EXISTS "first_name",
            DROP COLUMN IF EXISTS "last_name",
            DROP COLUMN IF EXISTS "role",
            DROP COLUMN IF EXISTS "password"
        `);
        await queryRunner.query(`
            DROP TYPE IF EXISTS "users_role_enum"
        `);
    }
}
exports.UpdateUserSchema1774093870715 = UpdateUserSchema1774093870715;
//# sourceMappingURL=1774093870715-UpdateUserSchema.js.map