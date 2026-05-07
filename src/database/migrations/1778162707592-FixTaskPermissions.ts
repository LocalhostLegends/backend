import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixTaskPermissions1778162707592 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      CROSS JOIN permissions p
      WHERE r.code IN ('admin', 'hr', 'manager', 'employee')
      AND p.action LIKE 'task.%'
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // No need to revert specifically unless we want to remove all task permissions from employees
  }
}
