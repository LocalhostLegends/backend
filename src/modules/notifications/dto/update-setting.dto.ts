import { ApiProperty } from '@nestjs/swagger';
import { NotificationType } from '@common/enums/notification-type.enum';
import { NotificationFields } from '../swagger/notification.fields';
import {
  IsNotificationEnabled,
  IsNotificationType,
} from '../decorators/notification-fields.decorators';

export class UpdateNotificationSettingDto {
  @ApiProperty(NotificationFields.type)
  @IsNotificationType()
  type: NotificationType;

  @ApiProperty(NotificationFields.isEnabled)
  @IsNotificationEnabled()
  isEnabled: boolean;
}
