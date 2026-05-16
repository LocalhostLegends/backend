import { SwaggerFieldsMap } from '@common/types/common.types';
import { UUID_EXAMPLE } from '@common/constants/common.constants';
import { ParticipantStatus } from '@common/enums/participant-status.enum';

export const EventFields = {
  id: {
    example: UUID_EXAMPLE,
    description: 'Event unique identifier',
    format: 'uuid',
  },
  title: {
    example: 'Team Sync Meeting',
    description: 'Event title',
    minLength: 3,
    maxLength: 255,
  },
  description: {
    example: 'Weekly sync to discuss progress and blockers',
    description: 'Event description',
    required: false,
  },
  startTime: {
    example: '2024-03-20T10:00:00Z',
    description: 'Event start time (ISO 8601)',
    format: 'date-time',
  },
  endTime: {
    example: '2024-03-20T11:00:00Z',
    description: 'Event end time (ISO 8601)',
    format: 'date-time',
  },
  location: {
    example: 'Conference Room A / Zoom link',
    description: 'Event location or meeting link',
    required: false,
  },
  isAllDay: {
    example: false,
    description: 'Whether the event lasts all day',
    default: false,
  },
  timezone: {
    example: 'America/New_York',
    description: 'Event timezone (IANA format)',
    default: 'UTC',
  },
  color: {
    example: '#4F46E5',
    description: 'Event color in HEX format',
    pattern: '^#[0-9A-Fa-f]{6}$',
  },
  participants: {
    example: [
      { userId: UUID_EXAMPLE, status: ParticipantStatus.PENDING },
      { userId: UUID_EXAMPLE, status: ParticipantStatus.ACCEPTED },
    ],
    description: 'List of event participants',
  },
  participantStatus: {
    enum: ParticipantStatus,
    example: ParticipantStatus.ACCEPTED,
    description: 'Current user response status',
  },
  customFields: {
    example: { priority: 'high', department: 'engineering' },
    description: 'Custom event metadata',
    required: false,
  },
  recurrence: {
    example: {
      frequency: 'weekly',
      interval: 1,
      until: '2024-12-31T23:59:59Z',
    },
    description: 'Recurrence rule (RRULE format or custom structure)',
    required: false,
  },
  createdAt: {
    description: 'Creation timestamp',
    format: 'date-time',
  },
  updatedAt: {
    description: 'Last update timestamp',
    format: 'date-time',
  },
} as const satisfies SwaggerFieldsMap;

// Query parameters fields
export const QueryEventFields = {
  startDate: {
    example: '2024-03-01T00:00:00Z',
    description: 'Filter events starting after this date',
    required: false,
    format: 'date-time',
  },
  endDate: {
    example: '2024-03-31T23:59:59Z',
    description: 'Filter events ending before this date',
    required: false,
    format: 'date-time',
  },
  status: {
    enum: ['confirmed', 'pending', 'cancelled'],
    example: 'confirmed',
    description: 'Filter by participant status',
    required: false,
  },
  search: {
    example: 'meeting',
    description: 'Search in title and description',
    required: false,
  },
} as const satisfies SwaggerFieldsMap;
