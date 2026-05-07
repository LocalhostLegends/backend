import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from '@database/entities/calendar-event.entity';
import { CalendarEventParticipant } from '@database/entities/calendar-event-participant.entity';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';

@Module({
  imports: [TypeOrmModule.forFeature([CalendarEvent, CalendarEventParticipant])],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class CalendarModule {}
