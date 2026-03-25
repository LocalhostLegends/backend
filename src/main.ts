import { NestFactory, Reflector } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { swaggerConfig, swaggerOptions } from './config/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());

  app.use(cookieParser());

  const corsOrigins = configService.get('cors.origins');
  app.enableCors({
    origin: corsOrigins[0] === '*' ? '*' : corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  const apiPrefix = configService.get('apiPrefix');
  app.setGlobalPrefix(apiPrefix);

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

  const port = process.env.PORT || configService.get('port') || 3175;
  await app.listen(port);

  const pgAdminEmail = configService.get('pgAdmin.email');
  const pgAdminPassword = configService.get('pgAdmin.password');
  const pgAdminPort = configService.get('pgAdmin.port');

  console.log('\n');
  console.log(' ==================================');
  console.log(`✅ Application is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`✅ Swagger docs: http://localhost:${port}/${apiPrefix}/docs`);
  console.log(`✅ pgAdmin: http://localhost:${pgAdminPort} (email: ${pgAdminEmail} / password: ${pgAdminPassword})`);
  console.log(`✅ Environment: ${configService.get('nodeEnv')}`);
  console.log(`✅ CORS: ${corsOrigins[0] === '*' ? 'all origins' : corsOrigins.join(', ')}`);
  console.log(' ==================================');
  console.log('\n');
}

bootstrap();