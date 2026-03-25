"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserTable1773948687962 = void 0;
class CreateUserTable1773948687962 {
    name = 'CreateUserTable1773948687962';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "email" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "users"`);
    }
}
exports.CreateUserTable1773948687962 = CreateUserTable1773948687962;
//# sourceMappingURL=1773948687962-CreateUserTable.js.map