import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { CalendarEventType } from '@common/enums/calendar-event-type.enum';

export class CreateEventDto {
  @ApiProperty({ example: 'Team Meeting' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Discuss project progress' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '2024-05-10T10:00:00Z' })
  @IsISO8601()
  startTime: string;

  @ApiProperty({ example: '2024-05-10T11:00:00Z' })
  @IsISO8601()
  endTime: string;

  @ApiProperty({ enum: CalendarEventType, example: CalendarEventType.MEETING })
  @IsEnum(CalendarEventType)
  type: CalendarEventType;

  @ApiPropertyOptional({ example: 'Meeting Room 1' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  attendees?: number;

  @ApiPropertyOptional({ type: [String], example: ['uuid1', 'uuid2'] })
  @IsOptional()
  @IsUUID('4', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  candidateId?: string;

  @ApiPropertyOptional({ example: 'uuid' })
  @IsOptional()
  @IsUUID()
  vacancyId?: string;

  @ApiPropertyOptional({ example: { source: 'recruitment' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
