import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PermissionAction } from '@common/enums/permission-action.enum';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { ParticipantStatus } from '@common/enums/participant-status.enum';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@ApiTags('Calendar Events')
@Controller('calendar/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly _eventsService: EventsService) {}

  @Post(':id/respond')
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @ApiOperation({ summary: 'Respond to event invitation' })
  @ApiResponse({ status: 200, description: 'Response saved' })
  async respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ParticipantStatus,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._eventsService.respond(id, status, user);
  }

  @Get()
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @ApiOperation({ summary: 'Get all calendar events for current user' })
  @ApiResponse({ status: 200, description: 'Return list of events' })
  async findAll(@Query() query: QueryEventDto, @CurrentUser() user: AuthorizedUser) {
    return this._eventsService.findAll(query, user);
  }

  @Get(':id')
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @ApiOperation({ summary: 'Get calendar event by ID' })
  @ApiResponse({ status: 200, description: 'Return event details' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthorizedUser) {
    return this._eventsService.findOne(id, user);
  }

  @Post()
  @RequirePermission(PermissionAction.CALENDAR_CREATE)
  @ApiOperation({ summary: 'Create new calendar event' })
  @ApiResponse({ status: 201, description: 'Event successfully created' })
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthorizedUser) {
    return this._eventsService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermission(PermissionAction.CALENDAR_UPDATE)
  @ApiOperation({ summary: 'Update calendar event' })
  @ApiResponse({ status: 200, description: 'Event successfully updated' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthorizedUser,
  ) {
    return this._eventsService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission(PermissionAction.CALENDAR_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete calendar event' })
  @ApiResponse({ status: 204, description: 'Event successfully deleted' })
  @ApiResponse({ status: 404, description: 'Event not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthorizedUser) {
    return this._eventsService.remove(id, user);
  }
}
