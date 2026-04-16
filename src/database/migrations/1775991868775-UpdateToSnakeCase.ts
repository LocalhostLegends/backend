import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateToSnakeCase1775991868775 implements MigrationInterface {
  name = 'UpdateToSnakeCase1775991868775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "logoUrl" TO "logo_url"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "isActive" TO "is_active"`);
    await queryRunner.query(
      `ALTER TABLE "companies" RENAME COLUMN "subscriptionPlan" TO "subscription_plan"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" RENAME COLUMN "subscriptionExpiresAt" TO "subscription_expires_at"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "deletedAt" TO "deleted_at"`);

    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "minSalary" TO "min_salary"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "maxSalary" TO "max_salary"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "gradeLevel" TO "grade_level"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "isActive" TO "is_active"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "deletedAt" TO "deleted_at"`);

    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "isActive" TO "is_active"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "deletedAt" TO "deleted_at"`);

    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "firstName" TO "first_name"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "lastName" TO "last_name"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "lockedUntil" TO "locked_until"`);
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "emailVerifiedAt" TO "email_verified_at"`,
    );
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "deletedAt" TO "deleted_at"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "createdBy" TO "created_by"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updatedBy" TO "updated_by"`);

    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "expiresAt" TO "expires_at"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "isUsed" TO "is_used"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "usedAt" TO "used_at"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "usedIp" TO "used_ip"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "createdAt" TO "created_at"`);

    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "expiresAt" TO "expires_at"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "sentCount" TO "sent_count"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "acceptedAt" TO "accepted_at"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "createdAt" TO "created_at"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "updatedAt" TO "updated_at"`);
    await queryRunner.query(
      `ALTER TABLE "invites" RENAME COLUMN "departmentId" TO "department_id"`,
    );
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "positionId" TO "position_id"`);
    await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN IF EXISTS "parentDepartmentId"`);
    await queryRunner.query(`ALTER TABLE "departments" DROP COLUMN IF EXISTS "managerId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "departmentId"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "positionId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_login_user_agent"`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "positionId" uuid`);
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "departmentId" uuid`);
    await queryRunner.query(`ALTER TABLE "departments" ADD COLUMN "managerId" uuid`);
    await queryRunner.query(`ALTER TABLE "departments" ADD COLUMN "parentDepartmentId" uuid`);

    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "position_id" TO "positionId"`);
    await queryRunner.query(
      `ALTER TABLE "invites" RENAME COLUMN "department_id" TO "departmentId"`,
    );
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "accepted_at" TO "acceptedAt"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "sent_count" TO "sentCount"`);
    await queryRunner.query(`ALTER TABLE "invites" RENAME COLUMN "expires_at" TO "expiresAt"`);

    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "used_ip" TO "usedIp"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "used_at" TO "usedAt"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "is_used" TO "isUsed"`);
    await queryRunner.query(`ALTER TABLE "tokens" RENAME COLUMN "expires_at" TO "expiresAt"`);

    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updated_by" TO "updatedBy"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "created_by" TO "createdBy"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "deleted_at" TO "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "email_verified_at" TO "emailVerifiedAt"`,
    );
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "locked_until" TO "lockedUntil"`);

    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "last_name" TO "lastName"`);
    await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "first_name" TO "firstName"`);

    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "deleted_at" TO "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "departments" RENAME COLUMN "is_active" TO "isActive"`);

    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "deleted_at" TO "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "is_active" TO "isActive"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "grade_level" TO "gradeLevel"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "max_salary" TO "maxSalary"`);
    await queryRunner.query(`ALTER TABLE "positions" RENAME COLUMN "min_salary" TO "minSalary"`);

    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "deleted_at" TO "deletedAt"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "updated_at" TO "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "created_at" TO "createdAt"`);
    await queryRunner.query(
      `ALTER TABLE "companies" RENAME COLUMN "subscription_expires_at" TO "subscriptionExpiresAt"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" RENAME COLUMN "subscription_plan" TO "subscriptionPlan"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "is_active" TO "isActive"`);
    await queryRunner.query(`ALTER TABLE "companies" RENAME COLUMN "logo_url" TO "logoUrl"`);
  }
}
