import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { SwaggerFieldsMap } from '@common/types/common.types';
import { NotificationType } from '@common/enums/notification-type.enum';

export const NotificationFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Notification id',
  },
  type: {
    enum: NotificationType,
    example: NotificationType.MENTION,
    description: 'Notification type',
  },
  title: {
    example: 'New message',
    description: 'Notification title',
  },
  message: {
    example: 'You have a new message from...',
    description: 'Notification message',
  },
  isRead: {
    example: false,
    description: 'Whether the notification is read',
  },
  isEnabled: {
    example: true,
    description: 'Whether the notification type is enabled for user',
  },
} as const satisfies SwaggerFieldsMap;
