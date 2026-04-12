import dataSource from './data-source';

async function run(): Promise<void> {
  try {
    await dataSource.initialize();
    await dataSource.runMigrations();
    await dataSource.destroy();
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

void run();
