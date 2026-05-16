import { MigrationInterface, QueryRunner } from 'typeorm';

export class PayrollModule1778573253679 implements MigrationInterface {
  name = 'PayrollModule1778573253679';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_users_manager_id"`);
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_user_notification_settings_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" DROP CONSTRAINT "FK_onboarding_template_steps_template_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" DROP CONSTRAINT "FK_onboarding_templates_company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" DROP CONSTRAINT "FK_onboarding_instance_steps_instance_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_onboarding_instances_company_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_onboarding_instances_template_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_onboarding_instances_employee_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user_id"`,
    );
    await queryRunner.query(`ALTER TABLE "leave_types" DROP CONSTRAINT "FK_leave_types_company"`);
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_leave_requests_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_leave_requests_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_leave_requests_employee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_leave_balances_type"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_leave_balances_employee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" DROP CONSTRAINT "FK_leave_audit_logs_actor"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" DROP CONSTRAINT "FK_leave_audit_logs_request"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" DROP CONSTRAINT "FK_leave_approvals_approver"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" DROP CONSTRAINT "FK_leave_approvals_request"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8dd"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_user_notification_settings_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_tasks_company_department"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ONBOARDING_EMPLOYEE_STATUS"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_is_read"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_leave_types_code_company"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_leave_requests_employee_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_leave_requests_company_status"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_leave_balances_employee_type"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_leave_audit_logs_request"`);
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "UQ_user_notification_settings_user_type"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."salaries_pay_frequency_enum" AS ENUM('MONTHLY', 'WEEKLY', 'BI_WEEKLY', 'HOURLY', 'ANNUAL')`,
    );
    await queryRunner.query(
      `CREATE TABLE "salaries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "pay_frequency" "public"."salaries_pay_frequency_enum" NOT NULL DEFAULT 'MONTHLY', "effective_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "REL_c12591382bdd41fa79264f339e" UNIQUE ("user_id"), CONSTRAINT "PK_20ca60aa8d4201c7bcb430fdb36" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_24ad4d73e3a96da4d2375b7bdf" ON "salaries" ("user_id", "company_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "salary_revisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "old_amount" numeric(12,2) NOT NULL, "new_amount" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL, "reason" text, "effective_date" date NOT NULL, "changed_by_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_56b80c606d602bec1010ebf9c9d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4bfe3a95c5a84d62b9d0afd9b4" ON "salary_revisions" ("user_id", "company_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payroll_periods_status_enum" AS ENUM('DRAFT', 'OPEN', 'PENDING_APPROVAL', 'PAID')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payroll_periods" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "company_id" uuid NOT NULL, "name" character varying(100) NOT NULL, "description" text, "currency" character varying(10) NOT NULL DEFAULT 'USD', "start_date" date NOT NULL, "end_date" date NOT NULL, "status" "public"."payroll_periods_status_enum" NOT NULL DEFAULT 'DRAFT', "total_amount" numeric(15,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2afd9a853dd55d80ef644b74358" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_4aa43c729e7c331f253e142dcd" ON "payroll_periods" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payroll_records_status_enum" AS ENUM('PENDING', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payroll_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "payroll_period_id" uuid NOT NULL, "user_id" uuid NOT NULL, "base_salary" numeric(12,2) NOT NULL, "bonuses_amount" numeric(12,2) NOT NULL DEFAULT '0', "deductions_total" numeric(12,2) NOT NULL DEFAULT '0', "total_net" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL DEFAULT 'USD', "metadata" jsonb, "status" "public"."payroll_records_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_869cabe268deb5726e742f2d3f0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_1b695f00721431c047656bc6a2" ON "payroll_records" ("payroll_period_id", "user_id") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bonuses_type_enum" AS ENUM('PERFORMANCE', 'REFERRAL', 'RETENTION', 'SIGN_ON', 'ONE_TIME', 'OTHER')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."bonuses_status_enum" AS ENUM('PENDING', 'APPROVED', 'PAID', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "bonuses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "amount" numeric(12,2) NOT NULL, "currency" character varying(10) NOT NULL, "type" "public"."bonuses_type_enum" NOT NULL DEFAULT 'PERFORMANCE', "reason" text, "date" date NOT NULL, "status" "public"."bonuses_status_enum" NOT NULL DEFAULT 'PENDING', "payroll_record_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_70d172c5a1bbe261fe01ff591fa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_daa619005cecbbfc9b30b61982" ON "bonuses" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_761e0385780ec143a365159885" ON "bonuses" ("user_id", "company_id") `,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."user_notification_settings_type_enum" RENAME TO "user_notification_settings_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_settings_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'leave_request_cancelled', 'leave_request_changes_requested', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ALTER COLUMN "type" TYPE "public"."user_notification_settings_type_enum" USING "type"::"text"::"public"."user_notification_settings_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_notification_settings_type_enum_old"`);
    await queryRunner.query(`ALTER TABLE "onboarding_template_steps" DROP COLUMN "type"`);
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_template_steps_type_enum" AS ENUM('TASK', 'MEETING', 'DOCUMENT')`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD "type" "public"."onboarding_template_steps_type_enum" NOT NULL DEFAULT 'TASK'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_template_steps" DROP COLUMN "assignee_role"`);
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_template_steps_assignee_role_enum" AS ENUM('EMPLOYEE', 'MANAGER', 'HR')`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD "assignee_role" "public"."onboarding_template_steps_assignee_role_enum" NOT NULL DEFAULT 'HR'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "onboarding_templates" ADD "deleted_at" TIMESTAMP`);
    await queryRunner.query(`ALTER TABLE "onboarding_instance_steps" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_instance_steps_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'ACCEPTED', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD "status" "public"."onboarding_instance_steps_status_enum" NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "status"`);
    await queryRunner.query(
      `CREATE TYPE "public"."onboarding_instances_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'ACCEPTED', 'COMPLETED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "status" "public"."onboarding_instances_status_enum" NOT NULL DEFAULT 'IN_PROGRESS'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'leave_request_cancelled', 'leave_request_changes_requested', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old" CASCADE`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c77db170eaadc7932bf3e0739b"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_definitions_entity_type_enum" RENAME TO "custom_field_definitions_entity_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance', 'leave_request')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_ref_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance', 'leave_request')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" ALTER COLUMN "entity_type" TYPE "public"."custom_field_definitions_entity_type_enum" USING "entity_type"::"text"::"public"."custom_field_definitions_entity_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" ALTER COLUMN "ref_entity_type" TYPE "public"."custom_field_definitions_ref_entity_type_enum" USING "ref_entity_type"::"text"::"public"."custom_field_definitions_ref_entity_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."custom_field_definitions_entity_type_enum_old" CASCADE`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_03c5272fb00651d59eef268df6"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a52fd57cc192bd50b909b5334"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_values_entity_type_enum" RENAME TO "custom_field_values_entity_type_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_values_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance', 'leave_request')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_values_value_entity_type_enum" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance', 'leave_request')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_values" ALTER COLUMN "entity_type" TYPE "public"."custom_field_values_entity_type_enum" USING "entity_type"::"text"::"public"."custom_field_values_entity_type_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_values" ALTER COLUMN "value_entity_type" TYPE "public"."custom_field_values_value_entity_type_enum" USING "value_entity_type"::"text"::"public"."custom_field_values_value_entity_type_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."custom_field_values_entity_type_enum_old" CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_52182ffd0f785e8256f8fcb4fd" ON "user_notification_settings" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6b24c466050484e73a248d0679" ON "tasks" ("company_id", "department_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_da8dd52e199f5d704ae08b74d5" ON "onboarding_instances" ("employee_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_9a8a82462cab47c73d25f49261" ON "notifications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f12148ce379462ebbb4d06cc13" ON "notifications" ("is_read") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_77ee7b06d6f802000c0846f3a5" ON "notifications" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_88c400535920e5123b2cab6a00" ON "leave_types" ("code", "company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_92849799dc997e8bd5fa871a45" ON "leave_requests" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_83141eeaaef5a92fbab76b256e" ON "leave_requests" ("employee_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8d23a340119a1321c33ec062b7" ON "leave_balances" ("employee_id", "leave_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6c8503a66476faa65ecad63637" ON "leave_audit_logs" ("leave_request_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c77db170eaadc7932bf3e0739b" ON "custom_field_definitions" ("company_id", "entity_type", "key") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a52fd57cc192bd50b909b5334" ON "custom_field_values" ("value_entity_type", "value_entity_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03c5272fb00651d59eef268df6" ON "custom_field_values" ("entity_type", "entity_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "UQ_d95c2bce267cdde9d872ae65da5" UNIQUE ("user_id", "type")`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca5" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salaries" ADD CONSTRAINT "FK_c12591382bdd41fa79264f339e0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salaries" ADD CONSTRAINT "FK_6155d4dbce69bbf1ebd08e0eb7a" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_ddab09c77fedb4d89b46874b1c0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_f20fe680ac442bd607411998ebe" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" ADD CONSTRAINT "FK_7dc6aae2108268245169fa9f51b" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_periods" ADD CONSTRAINT "FK_6781b8642c8c73abc81ee229254" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_records" ADD CONSTRAINT "FK_c1b746fda54e11b01ca2e52aaab" FOREIGN KEY ("payroll_period_id") REFERENCES "payroll_periods"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_records" ADD CONSTRAINT "FK_a104628dfc73edd2bca5cc5ebba" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD CONSTRAINT "FK_1fd9a3bb5044d64ad817481e29a" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD CONSTRAINT "FK_b436ea0cdd5a0c5d9d0475c15e2" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD CONSTRAINT "FK_e51ca3db94a9af1c2ec43cc5ff3" FOREIGN KEY ("instance_id") REFERENCES "onboarding_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD CONSTRAINT "FK_d00d577e87992a43a9d063b5bdb" FOREIGN KEY ("template_step_id") REFERENCES "onboarding_template_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD CONSTRAINT "FK_762b8925e0752253afda0758e9d" FOREIGN KEY ("assigned_to_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_ebfb3853e0f9e776791be3fb99d" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_f73f89746e0c4742ae063d96851" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_2b138515342654fac461333553d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_9a8a82462cab47c73d25f49261f" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_types" ADD CONSTRAINT "FK_dd27cdf2939bc23d54c5a76ffee" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_52b4b7c7d295e204add6dbe0a09" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_54a57db316598806786c2b95323" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_43c15abe870cf2a725b3d722b78" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_d64da0a991d2f4d23d86031530c" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_6c8503a66476faa65ecad636370" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_398d9aa7fe6e21f1ff0f6f52c2a" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_b3f4a08d07d0b4e3af3eef2c640" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_6fa4e76e9771931e93e0af409eb" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" ADD CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bonuses" ADD CONSTRAINT "FK_ce40cc5e553cf98bf906eb015d0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bonuses" ADD CONSTRAINT "FK_414e14fd1b3eafd1c2297b93152" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    // Salary Revision Requests
    await queryRunner.query(
      `CREATE TYPE "public"."salary_revision_requests_status_enum" AS ENUM('PENDING', 'MANAGER_APPROVED', 'APPROVED', 'REJECTED')`,
    );
    await queryRunner.query(`CREATE TABLE "salary_revision_requests" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(), 
            "user_id" uuid NOT NULL, 
            "company_id" uuid NOT NULL, 
            "current_amount" numeric(12,2) NOT NULL, 
            "requested_amount" numeric(12,2) NOT NULL, 
            "currency" character varying(10) NOT NULL, 
            "reason" text NOT NULL, 
            "status" "public"."salary_revision_requests_status_enum" NOT NULL DEFAULT 'PENDING', 
            "reviewed_by_id" uuid, 
            "review_note" text, 
            "reviewed_at" TIMESTAMP WITH TIME ZONE, 
            "created_at" TIMESTAMP NOT NULL DEFAULT now(), 
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(), 
            CONSTRAINT "PK_salary_revision_requests" PRIMARY KEY ("id")
        )`);

    await queryRunner.query(
      `CREATE INDEX "IDX_salary_revision_requests_user_company" ON "salary_revision_requests" ("user_id", "company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_salary_revision_requests_status" ON "salary_revision_requests" ("status") `,
    );

    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" ADD CONSTRAINT "FK_salary_revision_requests_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" ADD CONSTRAINT "FK_salary_revision_requests_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" ADD CONSTRAINT "FK_salary_revision_requests_reviewer" FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    // Permissions
    await queryRunner.query(
      `INSERT INTO "permissions" (action, description) VALUES ('payroll.read_self', 'Permission to read own payroll data') ON CONFLICT (action) DO NOTHING`,
    );

    await queryRunner.query(`
            INSERT INTO "role_permissions" (role_id, permission_id)
            SELECT r.id, p.id FROM roles r, permissions p
            WHERE r.code = 'employee' AND p.action = 'payroll.read_self'
            ON CONFLICT DO NOTHING
        `);

    await queryRunner.query(`
            INSERT INTO "role_permissions" (role_id, permission_id)
            SELECT r.id, p.id FROM roles r, permissions p
            WHERE r.code IN ('manager', 'hr') AND p.action = 'payroll.read_self'
            ON CONFLICT DO NOTHING
        `);

    await queryRunner.query(`
            INSERT INTO "role_permissions" (role_id, permission_id)
            SELECT r.id, p.id FROM roles r, permissions p
            WHERE r.code IN ('admin', 'super_admin') AND p.action = 'payroll.read_self'
            ON CONFLICT DO NOTHING
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "role_permissions" WHERE permission_id IN (SELECT id FROM "permissions" WHERE action = 'payroll.read_self')`,
    );
    await queryRunner.query(`DELETE FROM "permissions" WHERE action = 'payroll.read_self'`);

    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" DROP CONSTRAINT "FK_salary_revision_requests_reviewer"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" DROP CONSTRAINT "FK_salary_revision_requests_company"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revision_requests" DROP CONSTRAINT "FK_salary_revision_requests_user"`,
    );
    await queryRunner.query(`DROP TABLE "salary_revision_requests"`);
    await queryRunner.query(`DROP TYPE "public"."salary_revision_requests_status_enum"`);

    await queryRunner.query(
      `ALTER TABLE "bonuses" DROP CONSTRAINT "FK_414e14fd1b3eafd1c2297b93152"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bonuses" DROP CONSTRAINT "FK_ce40cc5e553cf98bf906eb015d0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" DROP CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" DROP CONSTRAINT "FK_6fa4e76e9771931e93e0af409eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" DROP CONSTRAINT "FK_b3f4a08d07d0b4e3af3eef2c640"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" DROP CONSTRAINT "FK_398d9aa7fe6e21f1ff0f6f52c2a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" DROP CONSTRAINT "FK_6c8503a66476faa65ecad636370"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_d64da0a991d2f4d23d86031530c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" DROP CONSTRAINT "FK_2f8aebce74941a2e2168e94ba68"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_43c15abe870cf2a725b3d722b78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_54a57db316598806786c2b95323"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" DROP CONSTRAINT "FK_52b4b7c7d295e204add6dbe0a09"`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_types" DROP CONSTRAINT "FK_dd27cdf2939bc23d54c5a76ffee"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" DROP CONSTRAINT "FK_9a8a82462cab47c73d25f49261f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_2b138515342654fac461333553d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_f73f89746e0c4742ae063d96851"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" DROP CONSTRAINT "FK_ebfb3853e0f9e776791be3fb99d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" DROP CONSTRAINT "FK_762b8925e0752253afda0758e9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" DROP CONSTRAINT "FK_d00d577e87992a43a9d063b5bdb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" DROP CONSTRAINT "FK_e51ca3db94a9af1c2ec43cc5ff3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" DROP CONSTRAINT "FK_b436ea0cdd5a0c5d9d0475c15e2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" DROP CONSTRAINT "FK_1fd9a3bb5044d64ad817481e29a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_records" DROP CONSTRAINT "FK_a104628dfc73edd2bca5cc5ebba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_records" DROP CONSTRAINT "FK_c1b746fda54e11b01ca2e52aaab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "payroll_periods" DROP CONSTRAINT "FK_6781b8642c8c73abc81ee229254"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_7dc6aae2108268245169fa9f51b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_f20fe680ac442bd607411998ebe"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salary_revisions" DROP CONSTRAINT "FK_ddab09c77fedb4d89b46874b1c0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salaries" DROP CONSTRAINT "FK_6155d4dbce69bbf1ebd08e0eb7a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salaries" DROP CONSTRAINT "FK_c12591382bdd41fa79264f339e0"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" DROP CONSTRAINT "FK_8769073e38c365f315426554ca5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "FK_52182ffd0f785e8256f8fcb4fd6"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_fba2d8e029689aa8fea98e53c91"`);
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" DROP CONSTRAINT "UQ_d95c2bce267cdde9d872ae65da5"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_03c5272fb00651d59eef268df6"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a52fd57cc192bd50b909b5334"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c77db170eaadc7932bf3e0739b"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6c8503a66476faa65ecad63637"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_8d23a340119a1321c33ec062b7"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_83141eeaaef5a92fbab76b256e"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_92849799dc997e8bd5fa871a45"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_88c400535920e5123b2cab6a00"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_77ee7b06d6f802000c0846f3a5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_f12148ce379462ebbb4d06cc13"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9a8a82462cab47c73d25f49261"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_da8dd52e199f5d704ae08b74d5"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_6b24c466050484e73a248d0679"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_52182ffd0f785e8256f8fcb4fd"`);
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_values_entity_type_enum_old" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_values" ALTER COLUMN "value_entity_type" TYPE "public"."custom_field_values_entity_type_enum_old" USING "value_entity_type"::"text"::"public"."custom_field_values_entity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."custom_field_values_value_entity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_values_entity_type_enum_old" RENAME TO "custom_field_values_entity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_values_entity_type_enum_old" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_values" ALTER COLUMN "entity_type" TYPE "public"."custom_field_values_entity_type_enum_old" USING "entity_type"::"text"::"public"."custom_field_values_entity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."custom_field_values_entity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_values_entity_type_enum_old" RENAME TO "custom_field_values_entity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_5a52fd57cc192bd50b909b5334" ON "custom_field_values" ("value_entity_id", "value_entity_type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_03c5272fb00651d59eef268df6" ON "custom_field_values" ("entity_id", "entity_type") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_entity_type_enum_old" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" ALTER COLUMN "ref_entity_type" TYPE "public"."custom_field_definitions_entity_type_enum_old" USING "ref_entity_type"::"text"::"public"."custom_field_definitions_entity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."custom_field_definitions_ref_entity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_definitions_entity_type_enum_old" RENAME TO "custom_field_definitions_entity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."custom_field_definitions_entity_type_enum_old" AS ENUM('user', 'job', 'department', 'company', 'candidate', 'job_application', 'task', 'calendar_event', 'onboarding_instance')`,
    );
    await queryRunner.query(
      `ALTER TABLE "custom_field_definitions" ALTER COLUMN "entity_type" TYPE "public"."custom_field_definitions_entity_type_enum_old" USING "entity_type"::"text"::"public"."custom_field_definitions_entity_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."custom_field_definitions_entity_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."custom_field_definitions_entity_type_enum_old" RENAME TO "custom_field_definitions_entity_type_enum"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_c77db170eaadc7932bf3e0739b" ON "custom_field_definitions" ("company_id", "entity_type", "key") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instances" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."onboarding_instances_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD "status" character varying(50) NOT NULL DEFAULT 'IN_PROGRESS'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_instance_steps" DROP COLUMN "status"`);
    await queryRunner.query(`DROP TYPE "public"."onboarding_instance_steps_status_enum"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD "status" character varying(50) NOT NULL DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "deleted_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_templates" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_template_steps" DROP COLUMN "assignee_role"`);
    await queryRunner.query(`DROP TYPE "public"."onboarding_template_steps_assignee_role_enum"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD "assignee_role" character varying(50) NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "onboarding_template_steps" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."onboarding_template_steps_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD "type" character varying(50) NOT NULL`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."user_notification_settings_type_enum_old" AS ENUM('leave_request_created', 'leave_request_approved', 'leave_request_rejected', 'candidate_stage_changed', 'candidate_assigned', 'employee_transferred', 'onboarding_task_assigned', 'task_assigned', 'task_comment_added', 'calendar_invitation', 'mention')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ALTER COLUMN "type" TYPE "public"."user_notification_settings_type_enum_old" USING "type"::"text"::"public"."user_notification_settings_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."user_notification_settings_type_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."user_notification_settings_type_enum_old" RENAME TO "user_notification_settings_type_enum"`,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_761e0385780ec143a365159885"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_daa619005cecbbfc9b30b61982"`);
    await queryRunner.query(`DROP TABLE "bonuses"`);
    await queryRunner.query(`DROP TYPE "public"."bonuses_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."bonuses_type_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1b695f00721431c047656bc6a2"`);
    await queryRunner.query(`DROP TABLE "payroll_records"`);
    await queryRunner.query(`DROP TYPE "public"."payroll_records_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4aa43c729e7c331f253e142dcd"`);
    await queryRunner.query(`DROP TABLE "payroll_periods"`);
    await queryRunner.query(`DROP TYPE "public"."payroll_periods_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4bfe3a95c5a84d62b9d0afd9b4"`);
    await queryRunner.query(`DROP TABLE "salary_revisions"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_24ad4d73e3a96da4d2375b7bdf"`);
    await queryRunner.query(`DROP TABLE "salaries"`);
    await queryRunner.query(`DROP TYPE "public"."salaries_pay_frequency_enum"`);
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "UQ_user_notification_settings_user_type" UNIQUE ("user_id", "type")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_audit_logs_request" ON "leave_audit_logs" ("leave_request_id") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_leave_balances_employee_type" ON "leave_balances" ("employee_id", "leave_type_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_company_status" ON "leave_requests" ("company_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_leave_requests_employee_status" ON "leave_requests" ("employee_id", "status") `,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_leave_types_code_company" ON "leave_types" ("code", "company_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_created_at" ON "notifications" ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ONBOARDING_EMPLOYEE_STATUS" ON "onboarding_instances" ("employee_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_company_department" ON "tasks" ("company_id", "department_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_notification_settings_user_id" ON "user_notification_settings" ("user_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "candidates" ADD CONSTRAINT "FK_4889aca8e7c52f6e0d0bf9c0d8dd" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_leave_approvals_request" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_approvals" ADD CONSTRAINT "FK_leave_approvals_approver" FOREIGN KEY ("approver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_leave_audit_logs_request" FOREIGN KEY ("leave_request_id") REFERENCES "leave_requests"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_audit_logs" ADD CONSTRAINT "FK_leave_audit_logs_actor" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_leave_balances_employee" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_balances" ADD CONSTRAINT "FK_leave_balances_type" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_employee" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_type" FOREIGN KEY ("leave_type_id") REFERENCES "leave_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_requests" ADD CONSTRAINT "FK_leave_requests_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "leave_types" ADD CONSTRAINT "FK_leave_types_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_onboarding_instances_employee_id" FOREIGN KEY ("employee_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_onboarding_instances_template_id" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instances" ADD CONSTRAINT "FK_onboarding_instances_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_instance_steps" ADD CONSTRAINT "FK_onboarding_instance_steps_instance_id" FOREIGN KEY ("instance_id") REFERENCES "onboarding_instances"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_templates" ADD CONSTRAINT "FK_onboarding_templates_company_id" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "onboarding_template_steps" ADD CONSTRAINT "FK_onboarding_template_steps_template_id" FOREIGN KEY ("template_id") REFERENCES "onboarding_templates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tokens" ADD CONSTRAINT "FK_8769073e38c365f315426554ca" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_notification_settings" ADD CONSTRAINT "FK_user_notification_settings_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_users_manager_id" FOREIGN KEY ("manager_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
