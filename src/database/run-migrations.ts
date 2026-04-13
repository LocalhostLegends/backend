import dataSource from './data-source';

async function run(): Promise<void> {
  try {
    await dataSource.initialize();

    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_DATABASE:', process.env.DB_DATABASE);
    console.log('DB_USERNAME:', process.env.DB_USERNAME);

    const dbInfoResult: unknown = await dataSource.query(
      'SELECT current_database() AS db, current_user AS user, current_schema() AS schema',
    );
    console.log('DB INFO:', dbInfoResult);

    const migrationsResult: unknown = await dataSource.query(
      'SELECT id, timestamp, name FROM migrations ORDER BY id',
    );
    console.log('MIGRATIONS TABLE:', migrationsResult);

    await dataSource.runMigrations();
    await dataSource.destroy();

    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

void run();
