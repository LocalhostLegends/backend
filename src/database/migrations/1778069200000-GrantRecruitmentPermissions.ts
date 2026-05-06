import { MigrationInterface, QueryRunner } from 'typeorm';

export class GrantRecruitmentPermissions1778069200000 implements MigrationInterface {
  name = 'GrantRecruitmentPermissions1778069200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            INSERT INTO "permissions" ("action", "description") VALUES
            ('job.create', 'Create job vacancy'),
            ('job.read', 'Read job vacancies'),
            ('job.update', 'Update job vacancy'),
            ('job.delete', 'Delete job vacancy'),
            ('candidate.create', 'Create candidate'),
            ('candidate.read', 'Read candidate info'),
            ('candidate.update', 'Update candidate info'),
            ('candidate.delete', 'Delete candidate'),
            ('application.create', 'Create job application'),
            ('application.read', 'Read job applications'),
            ('application.update_stage', 'Update application stage (Kanban)'),
            ('application.delete', 'Delete job application')
        `);

    await queryRunner.query(`
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            CROSS JOIN permissions p
            WHERE r.code IN ('admin', 'hr') 
            AND p.action LIKE ANY (ARRAY['job.%', 'candidate.%', 'application.%'])
        `);

    await queryRunner.query(`
            INSERT INTO role_permissions (role_id, permission_id)
            SELECT r.id, p.id
            FROM roles r
            JOIN permissions p ON p.action IN (
                'job.read',
                'application.read',
                'application.update_stage'
            )
            WHERE r.code = 'manager'
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DELETE FROM role_permissions 
            WHERE permission_id IN (
                SELECT id FROM permissions WHERE action LIKE ANY (ARRAY['job.%', 'candidate.%', 'application.%'])
            )
        `);

    await queryRunner.query(`
            DELETE FROM permissions 
            WHERE action LIKE ANY (ARRAY['job.%', 'candidate.%', 'application.%'])
        `);
  }
}
