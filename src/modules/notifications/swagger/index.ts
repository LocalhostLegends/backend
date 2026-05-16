import {
  ApiNotificationTags,
  ApiFindAllNotifications,
  ApiGetUnreadCount,
  ApiMarkAllAsRead,
  ApiMarkAsRead,
  ApiRemoveNotification,
  ApiGetNotificationSettings,
  ApiUpdateNotificationSetting,
} from './notifications.decorators';
import { NotificationFields } from './notification.fields';

export const swagger = {
  ApiTags: ApiNotificationTags,
  ApiFindAll: ApiFindAllNotifications,
  ApiGetUnreadCount: ApiGetUnreadCount,
  ApiMarkAllAsRead: ApiMarkAllAsRead,
  ApiMarkAsRead: ApiMarkAsRead,
  ApiRemove: ApiRemoveNotification,
  ApiGetSettings: ApiGetNotificationSettings,
  ApiUpdateSetting: ApiUpdateNotificationSetting,
};

export { NotificationFields };
