import { Controller, Get, Patch, Param, Delete, ParseUUIDPipe, Query, Body } from '@nestjs/common';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { NotificationsService } from './notifications.service';
import { NotificationsSettingsService } from './notifications-settings.service';
import { PaginationQueryDto } from '@modules/pagination/dto/pagination-query.dto';
import { UpdateNotificationSettingDto } from './dto/update-setting.dto';
import { swagger } from './swagger';

@swagger.ApiTags()
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly settingsService: NotificationsSettingsService,
  ) {}

  @Get()
  @swagger.ApiFindAll()
  findAll(@CurrentUser() user: AuthorizedUser, @Query() query: PaginationQueryDto) {
    return this.notificationsService.findAllForUser(user.id, query);
  }

  @Get('unread-count')
  @swagger.ApiGetUnreadCount()
  getUnreadCount(@CurrentUser() user: AuthorizedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch('read-all')
  @swagger.ApiMarkAllAsRead()
  markAllAsRead(@CurrentUser() user: AuthorizedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Patch(':id/read')
  @swagger.ApiMarkAsRead()
  markAsRead(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthorizedUser) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Delete(':id')
  @swagger.ApiRemove()
  remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthorizedUser) {
    return this.notificationsService.delete(user.id, id);
  }

  // Settings
  @Get('settings')
  @swagger.ApiGetSettings()
  getSettings(@CurrentUser() user: AuthorizedUser) {
    return this.settingsService.getSettings(user.id);
  }

  @Patch('settings')
  @swagger.ApiUpdateSetting()
  updateSetting(@CurrentUser() user: AuthorizedUser, @Body() dto: UpdateNotificationSettingDto) {
    return this.settingsService.updateSetting(user.id, dto.type, dto.isEnabled);
  }
}
