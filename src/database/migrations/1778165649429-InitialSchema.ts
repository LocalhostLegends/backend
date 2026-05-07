import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1778165649429 implements MigrationInterface {
  name = 'InitialSchema1778165649429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "positions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "code" character varying(50), "min_salary" numeric(10,2), "max_salary" numeric(10,2), "grade_level" character varying(10), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "company_id" uuid NOT NULL, CONSTRAINT "PK_17e4e62ccd5749b289ae3fae6f3" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ffe3ffebeb75f36766ce154e48" ON "positions" ("company_id", "title") `,
    );
    await queryRunner.query(
      `CREATE TABLE "company_profiles" ("company_id" uuid NOT NULL, "tax_id" character varying(100), "registration_number" character varying(100), "industry" character varying(100), "website" character varying(255), "phone" character varying(50), "email" character varying(255), "employee_count" integer, "company_size" character varying(50), CONSTRAINT "PK_30228dd283a0f14486346e1db96" PRIMARY KEY ("company_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."addresses_type_enum" AS ENUM('legal', 'physical', 'postal', 'branch')`,
    );
    await queryRunner.query(
      `CREATE TABLE "addresses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "country" character varying(100) NOT NULL, "city" character varying(100) NOT NULL, "street" character varying(255) NOT NULL, "postal_code" character varying(20), "type" "public"."addresses_type_enum" NOT NULL DEFAULT 'legal', "company_id" uuid, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(200) NOT NULL, "subdomain" character varying(100), "logo_url" character varying(500), "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "is_active" boolean NOT NULL DEFAULT true, "subscription_plan" character varying(50) NOT NULL DEFAULT 'free', "subscription_expires_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_665e863569cb7332e624dc88c8c" UNIQUE ("subdomain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3dacbb3eb4f095e29372ff8e13" ON "companies" ("name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "departments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "code" character varying(20), "budget" numeric(10,2), "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "company_id" uuid NOT NULL, "parent_department_id" uuid, "manager_id" uuid, CONSTRAINT "PK_839517a681a86bb84cbcc6a1e9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_924267c09f9e6d7d8302173d41" ON "departments" ("company_id", "name") `,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "action" character varying NOT NULL, "description" character varying, CONSTRAINT "UQ_1c1e0637ecf1f6401beb9a68abe" UNIQUE ("action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "code" character varying(50) NOT NULL, "is_system" boolean NOT NULL DEFAULT false, "company_id" uuid, CONSTRAINT "UQ_f6d54f95c31b73fb1bdd8e91d0c" UNIQUE ("code"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_security" ("user_id" uuid NOT NULL, "password" character varying(255), "last_login_at" TIMESTAMP, "last_login_ip" character varying(45), "last_login_user_agent" text, "failed_login_attempts" integer NOT NULL DEFAULT '0', "last_failed_login_at" TIMESTAMP, "locked_until" TIMESTAMP, "email_verified_at" TIMESTAMP, CONSTRAINT "PK_8a181d611c3325dc702a8286685" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("user_id" uuid NOT NULL, "language" character varying(10) NOT NULL DEFAULT 'en', "timezone" character varying(50) NOT NULL DEFAULT 'UTC', "notifications" jsonb NOT NULL DEFAULT '{"email":true,"push":true}', "theme" character varying(20) NOT NULL DEFAULT 'system', "metadata" jsonb NOT NULL DEFAULT '{}', CONSTRAINT "PK_4ed056b9344e6f7d8d46ec4b302" PRIMARY KEY ("user_id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('invited', 'active', 'blocked')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "date_of_birth" date, "hire_date" date NOT NULL, "status" "public"."users_status_enum" NOT NULL DEFAULT 'invited', "phone" character varying(20), "avatar" character varying(500), "permissions_version" integer NOT NULL DEFAULT '1', "created_by" uuid, "updated_by" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "company_id" uuid NOT NULL, "department_id" uuid, "position_id" uuid, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
    await queryRunner.query(`CREATE INDEX "IDX_3676155292d72c67cd4e090514" ON "users" ("status") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_9b9c040d8c37e2a1edebb72fb5" ON "users" ("email", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_13af76739939fc5cb3c90ab3e7" ON "users" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_72425d1279a7db35f9b6918167" ON "users" ("company_id", "email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tokens_type_enum" AS ENUM('activation', 'reset_password', 'magic_link')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying(500) NOT NULL, "type" "public"."tokens_type_enum" NOT NULL, "expires_at" TIMESTAMP NOT NULL, "is_used" boolean NOT NULL DEFAULT false, "used_at" TIMESTAMP, "used_ip" character varying(45), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "UQ_6a8ca5961656d13c16c04079dd3" UNIQUE ("token"), CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_306030d9411d291750fd115857" ON "tokens" ("user_id", "type") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_6a8ca5961656d13c16c04079dd" ON "tokens" ("token") `);
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_stage_enum" AS ENUM('backlog', 'todo', 'in_progress', 'review', 'done', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tasks_priority_enum" AS ENUM('low', 'medium', 'high', 'urgent')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "stage" "public"."tasks_stage_enum" NOT NULL DEFAULT 'todo', "priority" "public"."tasks_priority_enum" NOT NULL DEFAULT 'medium', "due_date" TIMESTAMP WITH TIME ZONE, "order" integer NOT NULL DEFAULT '0', "creator_id" uuid NOT NULL, "assignee_id" uuid, "company_id" uuid NOT NULL, "department_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_53fbfb9d05347278ea35ccb3ac" ON "tasks" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_59ae04b1b1ba8ab9fdd9b84701" ON "tasks" ("company_id", "stage") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_company_department" ON "tasks" ("company_id", "department_id")`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_tasks_department" ON "tasks" ("department_id")`);
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_status_enum" AS ENUM('draft', 'open', 'on_hold', 'closed')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."jobs_type_enum" AS ENUM('full_time', 'part_time', 'contract', 'freelance', 'internship')`,
    );
    await queryRunner.query(
      `CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "requirements" text, "benefits" text, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'draft', "type" "public"."jobs_type_enum" NOT NULL DEFAULT 'full_time', "company_id" uuid NOT NULL, "department_id" uuid, "creator_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_087a773c50525e348e26188e7c" ON "jobs" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fa8f106c019cb050738fd16527" ON "jobs" ("department_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_cf18ff30eda17e5d526125c963" ON "jobs" ("creator_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "candidates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying(100) NOT NULL, "last_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "phone" character varying(20), "resume_url" character varying(500), "company_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4889aca8e7c52f6e0d0bf9c0d8" ON "candidates" ("company_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1d29c79dffbcd4db6075fc55e3" ON "candidates" ("company_id", "email") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_stage_enum" AS ENUM('applied', 'screening', 'interview', 'technical', 'offer', 'rejected', 'hired')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, "stage" "public"."job_applications_stage_enum" NOT NULL DEFAULT 'applied', "order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99292c6cd0ed428e8f5b4e2295" ON "job_applications" ("job_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6ed185c3d4417cc1f5ec3f28e5" ON "job_applications" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invites_status_enum" AS ENUM('pending', 'accepted', 'expired', 'cancelled')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."invites_role_enum" AS ENUM('super_admin', 'admin', 'hr', 'manager', 'employee')`,
    );
    await queryRunner.query(
      `CREATE TABLE "invites" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "token" uuid NOT NULL, "status" "public"."invites_status_enum" NOT NULL DEFAULT 'pending', "role" "public"."invites_role_enum" NOT NULL, "expires_at" TIMESTAMP NOT NULL, "sent_count" integer NOT NULL DEFAULT '1', "accepted_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "company_id" uuid NOT NULL, "invited_by" uuid NOT NULL, "department_id" uuid, "position_id" uuid, CONSTRAINT "UQ_18a9a6c85f7cc6f42ebef3b3188" UNIQUE ("token"), CONSTRAINT "PK_aa52e96b44a714372f4dd31a0af" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08583b1882195ae2674f839132" ON "invites" ("email") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_18a9a6c85f7cc6f42ebef3b318" ON "invites" ("token") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16a47ec5cba5f23750f5d1f89c" ON "invites" ("email", "company_id", "status") `,
    );
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
      `CREATE TYPE "public"."calendar_events_type_enum" AS ENUM('meeting', 'work', 'hr', 'other')`,
    );
    await queryRunner.query(
      `CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(255) NOT NULL, "description" text, "start_time" TIMESTAMP WITH TIME ZONE NOT NULL, "end_time" TIMESTAMP WITH TIME ZONE NOT NULL, "type" "public"."calendar_events_type_enum" NOT NULL DEFAULT 'other', "location" character varying(255), "attendees" integer NOT NULL DEFAULT '0', "external_id" character varying(255), "candidate_id" uuid, "vacancy_id" uuid, "metadata" jsonb, "organizer_id" uuid NOT NULL, "company_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_1245851ef2622aec6b28254832" ON "calendar_events" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_16019a7604b27007ecbe9aba25" ON "calendar_events" ("external_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_511b6b534664db545ca5398526" ON "calendar_events" ("candidate_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_0faaccf592164e141b2742ed07" ON "calendar_events" ("vacancy_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9da25bb67c068f2768d141f111" ON "calendar_events" ("company_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d2197538732f5c3f6bdff2426f" ON "calendar_events" ("organizer_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE TABLE "auth_audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "event_type" character varying(100) NOT NULL, "user_id" uuid, "email_attempted" character varying(255), "ip" character varying(255), "user_agent" text, "request_id" character varying(255), "method" character varying(10), "path" character varying(500), "success" boolean NOT NULL DEFAULT false, "failure_reason" character varying(255), "enrichment_status" character varying(50) NOT NULL DEFAULT 'pending', "risk_score" integer, "suspicious" boolean, "country" character varying(100), "city" character varying(100), "browser" character varying(100), "os" character varying(100), "device_type" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_be11d76bd32256469e1a14a97db" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_178199805b901ccd220ab7740e" ON "role_permissions" ("role_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "user_roles" ("user_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("user_id", "role_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "positions" ADD CONSTRAINT "FK_6844c44333df4976bc4db69aec8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_profiles" ADD CONSTRAINT "FK_30228dd283a0f14486346e1db96" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" ADD CONSTRAINT "FK_21b07f425d667f94949fcc07914" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2" FOREIGN KEY ("parent_department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" ADD CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "roles" ADD CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_security" ADD CONSTRAINT "FK_8a181d611c3325dc702a8286685" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_7ae6334059289559722437bcc1c" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_0921d1972cf861d568f5271cd85" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_f4cb489461bc751498a28852356" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_855d484825b715c545349212c7f" FOREIGN KEY ("assignee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tasks" ADD CONSTRAINT "FK_tasks_department" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_087a773c50525e348e26188e7cc" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_fa8f106c019cb050738fd165271" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "jobs" ADD CONSTRAINT "FK_cf18ff30eda17e5d526125c9630" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" ADD CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_767f1a9880aab5cdaa0634121ab" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_6e727f063d839c0090364ea95f3" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_2d90cb5f0c779ab72db868f9f04" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" ADD CONSTRAINT "FK_7cabe5c9e1d6493ed1608b4d1c1" FOREIGN KEY ("position_id") REFERENCES "positions"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
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
    await queryRunner.query(
      `ALTER TABLE "calendar_events" ADD CONSTRAINT "FK_5fd0761abe234b27e7ea941f940" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_5fd0761abe234b27e7ea941f940"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_events" DROP CONSTRAINT "FK_b96ca56f0f09bc960647dd5a335"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" DROP CONSTRAINT "FK_c3290346db85ab981a0ccd26888"`,
    );
    await queryRunner.query(
      `ALTER TABLE "calendar_event_participants" DROP CONSTRAINT "FK_7fb36ee98417604477e47a6310c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_7cabe5c9e1d6493ed1608b4d1c1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_2d90cb5f0c779ab72db868f9f04"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_6e727f063d839c0090364ea95f3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "invites" DROP CONSTRAINT "FK_767f1a9880aab5cdaa0634121ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d"`,
    );
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_cf18ff30eda17e5d526125c9630"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_fa8f106c019cb050738fd165271"`);
    await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_087a773c50525e348e26188e7cc"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_department"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_53fbfb9d05347278ea35ccb3aca"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_855d484825b715c545349212c7f"`);
    await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_f4cb489461bc751498a28852356"`);
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_8e29a9d2f1fa57ebf1a4ce17353"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_0921d1972cf861d568f5271cd85"`);
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_7ae6334059289559722437bcc1c"`);
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_4ed056b9344e6f7d8d46ec4b302"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_security" DROP CONSTRAINT "FK_8a181d611c3325dc702a8286685"`,
    );
    await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_4bc1204a05dde26383e3955b0a1"`);
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_ef8a4fb89ff96bbe98f1798798c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_2d6673ae91cee09bef47d2a5de2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "departments" DROP CONSTRAINT "FK_541e3d07c93baa9cc42b149a5fb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "addresses" DROP CONSTRAINT "FK_21b07f425d667f94949fcc07914"`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_profiles" DROP CONSTRAINT "FK_30228dd283a0f14486346e1db96"`,
    );
    await queryRunner.query(
      `ALTER TABLE "positions" DROP CONSTRAINT "FK_6844c44333df4976bc4db69aec8"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_178199805b901ccd220ab7740e"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "auth_audit_logs"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d2197538732f5c3f6bdff2426f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9da25bb67c068f2768d141f111"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_0faaccf592164e141b2742ed07"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_511b6b534664db545ca5398526"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_16019a7604b27007ecbe9aba25"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1245851ef2622aec6b28254832"`);
    await queryRunner.query(`DROP TABLE "calendar_events"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_events_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f7bb0b6a6d4f1f5775ed44fd7c"`);
    await queryRunner.query(`DROP TABLE "calendar_event_participants"`);
    await queryRunner.query(`DROP TYPE "public"."calendar_event_participants_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_16a47ec5cba5f23750f5d1f89c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_18a9a6c85f7cc6f42ebef3b318"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_08583b1882195ae2674f839132"`);
    await queryRunner.query(`DROP TABLE "invites"`);
    await queryRunner.query(`DROP TYPE "public"."invites_role_enum"`);
    await queryRunner.query(`DROP TYPE "public"."invites_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6ed185c3d4417cc1f5ec3f28e5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_99292c6cd0ed428e8f5b4e2295"`);
    await queryRunner.query(`DROP TABLE "job_applications"`);
    await queryRunner.query(`DROP TYPE "public"."job_applications_stage_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1d29c79dffbcd4db6075fc55e3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4889aca8e7c52f6e0d0bf9c0d8"`);
    await queryRunner.query(`DROP TABLE "candidates"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cf18ff30eda17e5d526125c963"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_fa8f106c019cb050738fd16527"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_087a773c50525e348e26188e7c"`);
    await queryRunner.query(`DROP TABLE "jobs"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."jobs_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_59ae04b1b1ba8ab9fdd9b84701"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_53fbfb9d05347278ea35ccb3ac"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_department"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_company_department"`);
    await queryRunner.query(`DROP TABLE "tasks"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_priority_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tasks_stage_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6a8ca5961656d13c16c04079dd"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_306030d9411d291750fd115857"`);
    await queryRunner.query(`DROP TABLE "tokens"`);
    await queryRunner.query(`DROP TYPE "public"."tokens_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_72425d1279a7db35f9b6918167"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_13af76739939fc5cb3c90ab3e7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9b9c040d8c37e2a1edebb72fb5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3676155292d72c67cd4e090514"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "user_security"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_924267c09f9e6d7d8302173d41"`);
    await queryRunner.query(`DROP TABLE "departments"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3dacbb3eb4f095e29372ff8e13"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TYPE "public"."addresses_type_enum"`);
    await queryRunner.query(`DROP TABLE "company_profiles"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ffe3ffebeb75f36766ce154e48"`);
    await queryRunner.query(`DROP TABLE "positions"`);
  }
}
