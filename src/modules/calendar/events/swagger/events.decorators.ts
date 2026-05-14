import { applyDecorators, HttpStatus } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { ParticipantStatus } from '@common/enums/participant-status.enum';

export const ApiEventsTags = () => ApiTags('Calendar Events');

// POST /events/:id/respond
export const ApiRespondToEvent = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Respond to event invitation' }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Event unique identifier',
    }),
    ApiBody({
      schema: {
        type: 'object',
        required: ['status'],
        properties: {
          status: {
            type: 'string',
            enum: Object.values(ParticipantStatus),
            example: ParticipantStatus.ACCEPTED,
            description: 'Participant response status',
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Response saved successfully',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Event not found',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid status value',
    }),
  );
};

// GET /events
export const ApiFindAllEvents = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Get all calendar events for current user',
      description: 'Returns list of events with pagination and filtering options',
    }),
    ApiQuery({
      name: 'page',
      example: 1,
      required: false,
      type: Number,
      description: 'Page number',
    }),
    ApiQuery({
      name: 'limit',
      example: 20,
      required: false,
      type: Number,
      description: 'Items per page',
    }),
    ApiQuery({
      name: 'startDate',
      example: '2024-03-01T00:00:00Z',
      required: false,
      type: String,
      format: 'date-time',
      description: 'Filter events starting after this date',
    }),
    ApiQuery({
      name: 'endDate',
      example: '2024-03-31T23:59:59Z',
      required: false,
      type: String,
      format: 'date-time',
      description: 'Filter events ending before this date',
    }),
    ApiQuery({
      name: 'status',
      example: 'confirmed',
      required: false,
      type: String,
      enum: ['confirmed', 'pending', 'cancelled'],
      description: 'Filter by participant status',
    }),
    ApiQuery({
      name: 'search',
      example: 'meeting',
      required: false,
      type: String,
      description: 'Search in title and description',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Return list of events',
      type: 'array',
      schema: {
        type: 'array',
        items: { $ref: '#/components/schemas/CalendarEventWithCustomFields' },
      },
    }),
  );
};

// GET /events/:id
export const ApiFindOneEvent = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Get calendar event by ID' }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Event unique identifier',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Return event details',
      type: 'object',
      schema: { $ref: '#/components/schemas/CalendarEventWithCustomFields' },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Event not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User is not a participant of this event',
    }),
  );
};

// POST /events
export const ApiCreateEvent = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Create new calendar event' }),
    ApiBody({
      type: CreateEventDto,
      description: 'Event creation payload',
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: 'Event successfully created',
      type: 'object',
      schema: { $ref: '#/components/schemas/CalendarEventWithCustomFields' },
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid event data or time conflict',
    }),
    ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Unauthorized',
    }),
  );
};

// PATCH /events/:id
export const ApiUpdateEvent = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Update calendar event' }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Event unique identifier',
    }),
    ApiBody({
      type: UpdateEventDto,
      description: 'Event update payload',
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: 'Event successfully updated',
      type: 'object',
      schema: { $ref: '#/components/schemas/CalendarEventWithCustomFields' },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Event not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User is not the organizer',
    }),
    ApiResponse({
      status: HttpStatus.BAD_REQUEST,
      description: 'Invalid update data',
    }),
  );
};

// DELETE /events/:id
export const ApiDeleteEvent = () => {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiOperation({ summary: 'Delete calendar event' }),
    ApiParam({
      name: 'id',
      type: 'string',
      format: 'uuid',
      example: '123e4567-e89b-12d3-a456-426614174000',
      description: 'Event unique identifier',
    }),
    ApiResponse({
      status: HttpStatus.NO_CONTENT,
      description: 'Event successfully deleted',
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: 'Event not found',
    }),
    ApiResponse({
      status: HttpStatus.FORBIDDEN,
      description: 'User is not the organizer',
    }),
  );
};
