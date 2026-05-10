import { applyDecorators, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NotificationFields } from './notification.fields';

export const ApiNotificationTags = () => ApiTags('Notifications');

export const ApiFindAllNotifications = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get all notifications for current user' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'List of notifications',
    }),
  );
};

export const ApiGetUnreadCount = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get unread notifications count' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Unread notifications count',
      type: Number,
    }),
  );
};

export const ApiMarkAllAsRead = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Mark all notifications as read' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'All notifications marked as read',
    }),
  );
};

export const ApiMarkAsRead = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Mark notification as read' }),
    ApiParam({
      name: 'id',
      description: 'Notification UUID',
      type: String,
      example: NotificationFields.id.example,
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification marked as read',
    }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' }),
  );
};

export const ApiRemoveNotification = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete notification' }),
    ApiParam({
      name: 'id',
      description: 'Notification UUID',
      type: String,
      example: NotificationFields.id.example,
    }),
    ApiResponse({ status: HttpStatus.OK, description: 'Notification deleted successfully' }),
    ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Notification not found' }),
  );
};

export const ApiGetNotificationSettings = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get user notification settings' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'User notification settings',
    }),
  );
};

export const ApiUpdateNotificationSetting = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update user notification setting' }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Notification setting updated successfully',
    }),
  );
};
