import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PermissionGuard } from '@modules/permissions/guards/permission.guard';
import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { CoreModule } from '@modules/core/core.module';
import { StorageModule } from '@modules/storage/storage.module';
import { PaginationModule } from '@modules/pagination/pagination.module';
import { OrganizationModule } from '@modules/organization/organization.module';
import { RecruitmentModule } from '@modules/recruitment/recruitment.module';
import { CalendarModule } from '@modules/calendar/calendar.module';
import { TasksModule } from '@modules/tasks/tasks.module';
import { LeaveModule } from '@modules/leave/leave.module';
import { PayrollModule } from '@modules/payroll/payroll.module';
import { NotificationsModule } from '@modules/notifications/notifications.module';
import { PermissionsModule } from '@modules/permissions/permissions.module';
import { OnboardingModule } from '@modules/onboarding/onboarding.module';
import { CustomFieldsModule } from '@modules/custom-fields/custom-fields.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';
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
    EventEmitterModule.forRoot({
      wildcard: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        ...config.database,

        autoLoadEntities: true,
        entities: [__dirname + '/database/entities/**/*.entity{.ts,.js}'],
        synchronize: false,
        migrationsRun: false,
        logging: false,
        extra: {
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 2000,
        },
      }),
    }),
    CoreModule,
    OrganizationModule,
    PermissionsModule,
    RecruitmentModule,
    CalendarModule,
    TasksModule,
    LeaveModule,
    PayrollModule,
    NotificationsModule,
    CustomFieldsModule,
    OnboardingModule,
    StorageModule,
    DashboardModule,
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
