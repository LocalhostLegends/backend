import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationsSettingsService } from '../notifications-settings.service';
import { BaseNotificationEvent } from '../events/notification.events';

@Injectable()
export class NotificationsListener {
  private readonly logger = new Logger(NotificationsListener.name);

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: NotificationsSettingsService,
  ) {}

  @OnEvent('notification.*')
  async handleNotificationEvent(event: BaseNotificationEvent) {
    this.logger.log(`Handling notification event: ${event.type} for user: ${event.userId}`);

    const isEnabled = await this.settingsService.isNotificationEnabled(event.userId, event.type);
    if (!isEnabled) {
      this.logger.log(
        `Notification type ${event.type} is disabled for user ${event.userId}. Skipping.`,
      );
      return;
    }

    try {
      await this.notificationsService.create({
        userId: event.userId,
        type: event.type,
        title: event.title,
        message: event.message,
        metadata: event.metadata,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to create notification for event ${event.type}: ${errorMessage}`);
    }
  }
}
