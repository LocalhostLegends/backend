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
import { PermissionAction } from '@common/enums/permission-action.enum';
import { RequirePermission } from '@modules/permissions/decorators/require-permission.decorator';
import { CurrentUser } from '@modules/core/users/decorators/current-user.decorator';
import type { AuthorizedUser } from '@modules/core/users/users.types';
import { JwtAuthGuard } from '@modules/core/auth/guards/jwt-auth.guard';
import { ParticipantStatus } from '@common/enums/participant-status.enum';
import { EventsService, CalendarEventWithCustomFields } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';
import { Swagger } from './swagger';

@Swagger.ApiTags()
@Controller('calendar/events')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly _eventsService: EventsService) {}

  @Post(':id/respond')
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @Swagger.ApiRespond()
  async respond(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: ParticipantStatus,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._eventsService.respond(id, status, user);
  }

  @Get()
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @Swagger.ApiFindAll()
  async findAll(
    @Query() query: QueryEventDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields[]> {
    return this._eventsService.findAll(query, user);
  }

  @Get(':id')
  @RequirePermission(PermissionAction.CALENDAR_READ)
  @Swagger.ApiFindOne()
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields> {
    return this._eventsService.findOne(id, user);
  }

  @Post()
  @RequirePermission(PermissionAction.CALENDAR_CREATE)
  @Swagger.ApiCreate()
  async create(
    @Body() dto: CreateEventDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields> {
    return this._eventsService.create(dto, user);
  }

  @Patch(':id')
  @RequirePermission(PermissionAction.CALENDAR_UPDATE)
  @Swagger.ApiUpdate()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields> {
    return this._eventsService.update(id, dto, user);
  }

  @Delete(':id')
  @RequirePermission(PermissionAction.CALENDAR_DELETE)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Swagger.ApiDelete()
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthorizedUser,
  ): Promise<void> {
    return this._eventsService.remove(id, user);
  }
}
