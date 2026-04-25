import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { SeedService } from './seed/seed.service';
import 'dotenv/config';

async function bootstrap(): Promise<void> {
  const nodeEnv = process.env.NODE_ENV;

  console.log(`Current NODE_ENV: ${nodeEnv}`);

  if (nodeEnv === 'production') {
    console.log('Production environment detected');
    console.log('Seed skipped in production for safety');
    return;
  }

  const app = await NestFactory.createApplicationContext(AppModule);

  const seedService = app.get(SeedService);
  await seedService.seed();

  await app.close();
}

bootstrap()
  .then(() => {
    console.log('Seed process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed', error);
    process.exit(1);
  });
