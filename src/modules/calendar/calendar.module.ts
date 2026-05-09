import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CalendarEvent } from '@database/entities/calendar-event.entity';
import { CalendarEventParticipant } from '@database/entities/calendar-event-participant.entity';
import { CustomFieldsModule } from '@modules/custom-fields/custom-fields.module';
import { EventsController } from './events/events.controller';
import { EventsService } from './events/events.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarEvent, CalendarEventParticipant]),
    CustomFieldsModule,
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class CalendarModule {}
