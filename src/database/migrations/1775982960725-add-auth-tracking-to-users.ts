import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddAuthTrackingToUsers1775982960725 implements MigrationInterface {
  name = 'AddAuthTrackingToUsers1775982960725';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      { name: 'failed_login_attempts', type: 'int', default: 0, isNullable: true },
      { name: 'last_failed_login_at', type: 'timestamp', isNullable: true },
      { name: 'last_login_ip', type: 'varchar', length: '255', isNullable: true },
      { name: 'last_login_user_agent', type: 'text', isNullable: true },
      { name: 'last_login_at', type: 'timestamp', isNullable: true },
    ];

    for (const column of columns) {
      const hasColumn = await queryRunner.hasColumn('users', column.name);
      if (!hasColumn) {
        await queryRunner.addColumn('users', new TableColumn(column));
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columns = [
      'last_login_at',
      'last_login_user_agent',
      'last_login_ip',
      'last_failed_login_at',
      'failed_login_attempts',
    ];

    for (const columnName of columns) {
      const hasColumn = await queryRunner.hasColumn('users', columnName);
      if (hasColumn) {
        await queryRunner.dropColumn('users', columnName);
      }
    }
  }
}
