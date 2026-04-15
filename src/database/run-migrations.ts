import dataSource from './data-source';

async function run(): Promise<void> {
  try {
    await dataSource.initialize();

    const pendingMigrations = await dataSource.showMigrations();

    if (!pendingMigrations) {
      console.log('No pending migrations');
    } else {
      console.log('Running pending migrations...');
      await dataSource.runMigrations();
      console.log('Migrations completed successfully');
    }

    await dataSource.destroy();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

void run();
