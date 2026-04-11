import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { CoreModule } from '@modules/core/core.module';
import { StorageModule } from '@modules/storage/storage.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { SeedModule } from '@database/seed/seed.module';
import configuration from '@config/configuration';

import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { RequestContextMiddleware } from './common/middleware/request-context.middleware';

interface DatabaseConfig {
  url?: string;
  ssl?: boolean | { rejectUnauthorized: boolean };
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig = configService.get<DatabaseConfig>('database') ?? {};
        const isProduction = configService.get<string>('nodeEnv') === 'production';

        return {
          type: 'postgres' as const,
          ...(databaseConfig.url
            ? {
                url: databaseConfig.url,
                ssl: databaseConfig.ssl,
              }
            : {
                host: databaseConfig.host,
                port: databaseConfig.port,
                username: databaseConfig.username,
                password: databaseConfig.password,
                database: databaseConfig.database,
                ssl: isProduction ? { rejectUnauthorized: false } : false,
              }),
          entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
          synchronize: false,
          migrationsRun: false,
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          logging: configService.get<string>('nodeEnv') === 'development',
        };
      },
    }),
    CoreModule,
    OrganizationModule,
    StorageModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, RequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
