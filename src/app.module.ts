import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { UsersModule } from './modules/users/users.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { PositionsModule } from './modules/positions/positions.module';
import { AuthModule } from './modules/auth/auth.module';
import { SeedModule } from './database/seed/seed.module';
import { CloudflareModule } from './modules/cloudflare/cloudflare.module';
import { HealthModule } from './modules/health/health.module';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

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
      envFilePath:
        process.env.NODE_ENV === 'production'
          ? '.env.production'
          : '.env.development',
      load: [configuration],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const databaseConfig =
          configService.get<DatabaseConfig>('database') ?? {};
        const isProduction =
          configService.get<string>('nodeEnv') === 'production';

        return {
          type: 'postgres' as const,
          ...(databaseConfig.url
            ? {
                url: databaseConfig.url,
                ssl: databaseConfig.ssl,
              }
            : {
                host: databaseConfig?.host,
                port: databaseConfig?.port,
                username: databaseConfig?.username,
                password: databaseConfig?.password,
                database: databaseConfig?.database,
                ssl: isProduction ? { rejectUnauthorized: false } : false,
              }),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: false,
          migrationsRun: false,
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        };
      },
    }),
    CloudflareModule,

    UsersModule,

    DepartmentsModule,

    PositionsModule,

    AuthModule,

    SeedModule,

    HealthModule,
  ],
  controllers: [],
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
export class AppModule {}
