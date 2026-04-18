import '@common/init/env';

import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import config from '@config/app.config';
import { swaggerConfig, swaggerOptions } from '@config/swagger.config';
import { HttpExceptionFilter } from '@common/filters/http-exception.filter';

import { AppModule } from './app.module';

function setupMiddleware(app: INestApplication) {
  app.use(helmet());
  app.use(cookieParser());
}

function setupCors(app: INestApplication) {
  app.enableCors({
    origin: config.cors,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
}

function setupPipes(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

function setupSwagger(app: INestApplication) {
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(`${config.apiPrefix}/docs`, app, document, swaggerOptions);
}

function logStartup() {
  console.log('\n');
  console.log(' ==================================');
  console.log(`✅ Application is running on: http://localhost:${config.port}/${config.apiPrefix}`);
  console.log(`✅ Swagger docs: http://localhost:${config.port}/${config.apiPrefix}/docs`);
  console.log(
    `✅ pgAdmin: http://localhost:${config.pgAdmin.port} (user: ${config.pgAdmin.user} / password: ${config.pgAdmin.password})`,
  );
  console.log(
    `✅ Storage: ${config.storage.endpoint} (username: ${config.storage.accessKeyId} / password: ${config.storage.secretAccessKey})`,
  );
  console.log(`✅ Environment: ${config.nodeEnv}`);
  console.log(`✅ CORS: ${config.cors.origins.join(', ')}`);
  console.log(' ==================================');
  console.log('\n');
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  setupMiddleware(app);
  setupCors(app);

  app.setGlobalPrefix(config.apiPrefix, { exclude: ['health'] });

  setupPipes(app);
  setupSwagger(app);

  await app.listen(config.port);

  logStartup();
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
