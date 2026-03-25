"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserRoleEnumReplaceManagerWithHr1774255419189 = void 0;
class UpdateUserRoleEnumReplaceManagerWithHr1774255419189 {
    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT
        `);
        await queryRunner.query(`
            CREATE TYPE "users_role_enum_new" AS ENUM ('admin', 'employee', 'hr')
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "users_role_enum_new" 
            USING (CASE 
                WHEN "role"::text = 'manager' THEN 'hr'::text
                ELSE "role"::text 
            END)::users_role_enum_new
        `);
        await queryRunner.query(`
            DROP TYPE "users_role_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "users_role_enum_new" RENAME TO "users_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'employee'
        `);
    }
    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT
        `);
        await queryRunner.query(`
            CREATE TYPE "users_role_enum_old" AS ENUM ('admin', 'manager', 'employee')
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" TYPE "users_role_enum_old" 
            USING (CASE 
                WHEN "role"::text = 'hr' THEN 'manager'::text
                ELSE "role"::text 
            END)::users_role_enum_old
        `);
        await queryRunner.query(`
            DROP TYPE "users_role_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "users_role_enum_old" RENAME TO "users_role_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'employee'
        `);
    }
}
exports.UpdateUserRoleEnumReplaceManagerWithHr1774255419189 = UpdateUserRoleEnumReplaceManagerWithHr1774255419189;
//# sourceMappingURL=1774255419189-UpdateUserRoleEnumReplaceManagerWithHr.js.map