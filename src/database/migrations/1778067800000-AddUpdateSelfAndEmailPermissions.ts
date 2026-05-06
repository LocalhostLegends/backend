import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUpdateSelfAndEmailPermissions1778067800000 implements MigrationInterface {
  name = 'AddUpdateSelfAndEmailPermissions1778067800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "permissions" ("action", "description") VALUES
      ('user.update_self', 'Update own basic profile info'),
      ('user.update_email', 'Update any user email (Admin only)')
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.action = 'user.update_self'
      WHERE r.is_system = true
    `);

    await queryRunner.query(`
      INSERT INTO role_permissions (role_id, permission_id)
      SELECT r.id, p.id
      FROM roles r
      JOIN permissions p ON p.action = 'user.update_email'
      WHERE r.code = 'admin'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM role_permissions 
      WHERE permission_id IN (
        SELECT id FROM permissions WHERE action IN ('user.update_self', 'user.update_email')
      )
    `);

    await queryRunner.query(`
      DELETE FROM permissions WHERE action IN ('user.update_self', 'user.update_email')
    `);
  }
}
