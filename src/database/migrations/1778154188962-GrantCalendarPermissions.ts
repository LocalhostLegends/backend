import { MigrationInterface, QueryRunner } from 'typeorm';

export class GrantCalendarPermissions1778154188962 implements MigrationInterface {
  name = 'GrantCalendarPermissions1778154188962';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("action", "description") VALUES
      ('calendar.create', 'Create own calendar events'),
      ('calendar.read', 'Read own calendar events'),
      ('calendar.update', 'Update own calendar events'),
      ('calendar.delete', 'Delete own calendar events')
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code IN ('admin', 'hr', 'manager', 'employee')
      AND p.action LIKE 'calendar.%'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE action LIKE 'calendar.%'
      )
    `);

    await queryRunner.query(`
      DELETE FROM permissions 
      WHERE action LIKE 'calendar.%'
    `);
  }
}
