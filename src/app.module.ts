import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PermissionGuard } from '@modules/permissions/guards/permission.guard';
import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { CoreModule } from '@modules/core/core.module';
import { StorageModule } from '@modules/storage/storage.module';
import { PaginationModule } from '@modules/pagination/pagination.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { SeedModule } from '@database/seed/seed.module';
import { ResponseInterceptor } from '@common/interceptors/response.interceptor';
import { GlobalExceptionFilter } from '@common/filters/global-exception.filter';
import { RequestLoggerMiddleware } from '@common/middleware/request-logger.middleware';
import { RequestContextMiddleware } from '@common/middleware/request-context.middleware';
import config from '@config/app.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        ...config.database,

        autoLoadEntities: true,
        entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrationsRun: false,
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        logging: false,
      }),
    }),
    CoreModule,
    OrganizationModule,
    PermissionsModule,
    StorageModule,
    SeedModule,
    PaginationModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(RequestContextMiddleware, RequestLoggerMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
