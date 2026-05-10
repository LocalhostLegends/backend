import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from '@database/entities/notification.entity';
import { UserNotificationSetting } from '@database/entities/user-notification-setting.entity';
import { NotificationsService } from './notifications.service';
import { NotificationsSettingsService } from './notifications-settings.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsListener } from './listeners/notifications.listener';
import { PaginationModule } from '@modules/pagination/pagination.module';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, UserNotificationSetting]), PaginationModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsSettingsService, NotificationsListener],
  exports: [NotificationsService, NotificationsSettingsService],
})
export class NotificationsModule {}
