import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { swaggerConfig, swaggerOptions } from './config/swagger.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);

  app.use(helmet());
  app.use(cookieParser());

  const corsOrigins = configService.get<string[]>('cors.origins') ?? ['*'];

  app.enableCors({
    origin: corsOrigins[0] === '*' ? '*' : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const apiPrefix = configService.get<string>('apiPrefix') ?? 'api';
  app.setGlobalPrefix(apiPrefix, { exclude: ['health'] });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`${apiPrefix}/docs`, app, document, swaggerOptions);

  const port = process.env.PORT ?? configService.get<number>('port') ?? 3175;
  await app.listen(port);

  const pgAdminEmail = configService.get<string>('pgAdmin.email') ?? 'not set';
  const pgAdminPassword =
    configService.get<string>('pgAdmin.password') ?? 'not set';
  const pgAdminPort = configService.get<number>('pgAdmin.port') ?? 5050;
  const nodeEnv = configService.get<string>('nodeEnv') ?? 'development';

  console.log('\n');
  console.log(' ==================================');
  console.log(
    `✅ Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  console.log(`✅ Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
  console.log(
    `✅ pgAdmin: http://localhost:${pgAdminPort} (email: ${pgAdminEmail} / password: ${pgAdminPassword})`,
  );
  console.log(`✅ Environment: ${nodeEnv}`);
  console.log(
    `✅ CORS: ${corsOrigins[0] === '*' ? 'all origins' : corsOrigins.join(', ')}`,
  );
  console.log(' ==================================');
  console.log('\n');
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start application', error);
  process.exit(1);
});
