import { applyDecorators } from '@nestjs/common';
import { IsBoolean, IsEnum } from 'class-validator';
import { NotificationType } from '@common/enums/notification-type.enum';

export const IsNotificationType = () => applyDecorators(IsEnum(NotificationType));

export const IsNotificationEnabled = () => applyDecorators(IsBoolean());
