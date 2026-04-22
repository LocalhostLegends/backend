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
  const isProduction = config.nodeEnv === 'production';
  const localAppUrl = `http://localhost:${config.port}`;
  const apiUrl = `${localAppUrl}/${config.apiPrefix}`;
  const healthUrl = `${localAppUrl}/health`;

  console.log('\n');
  console.log(' ==================================');

  if (isProduction) {
    console.log('✅ Application started successfully');
    console.log(`✅ Environment: ${config.nodeEnv}`);
    console.log(`✅ API: ${apiUrl}`);
    console.log(`✅ Health: ${healthUrl}`);
  } else {
    console.log(`✅ Application is running on: ${apiUrl}`);
    console.log(`✅ Swagger docs: ${apiUrl}/docs`);
    console.log(`✅ pgAdmin: http://localhost:${config.pgAdmin.port}`);
    console.log(`✅ Storage provider: configured`);
    console.log(`✅ Environment: ${config.nodeEnv}`);
    console.log(`✅ CORS: ${config.cors.origins.join(', ')}`);
  }

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
