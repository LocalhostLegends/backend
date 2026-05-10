import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CalendarEvent } from '@database/entities/calendar-event.entity';
import { CalendarEventParticipant } from '@database/entities/calendar-event-participant.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ParticipantStatus } from '@common/enums/participant-status.enum';
import { CustomFieldsService } from '@modules/custom-fields/custom-fields.service';
import { EntityType } from '@common/enums/entity-type.enum';
import { CustomFieldsMap } from '@modules/custom-fields/custom-fields.types';
import { CalendarEventInvitedEvent } from '@modules/notifications/events/notification.events';

import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

export type CalendarEventWithCustomFields = CalendarEvent & { customFields: CustomFieldsMap };

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly _eventsRepository: Repository<CalendarEvent>,
    @InjectRepository(CalendarEventParticipant)
    private readonly _participantsRepository: Repository<CalendarEventParticipant>,
    private readonly _customFieldsService: CustomFieldsService,
    private readonly _eventBus: EventEmitter2,
  ) {}

  async findAll(
    query: QueryEventDto,
    user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields[]> {
    const { startDate, endDate } = query;

    const qb = this._eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.companyId = :companyId', { companyId: user.companyId });

    qb.andWhere(
      new Brackets((innerQb) => {
        innerQb
          .where('event.organizerId = :userId', { userId: user.id })
          .orWhere('participant.userId = :userId', { userId: user.id });
      }),
    );

    if (startDate && endDate) {
      qb.andWhere('event.startTime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
    }

    qb.orderBy('event.startTime', 'ASC');

    const events = await qb.getMany();

    if (events.length === 0) return [];

    const eventIds = events.map((e) => e.id);
    const allCustomFields = await this._customFieldsService.getValuesForMultipleEntities(
      user.companyId,
      EntityType.CALENDAR_EVENT,
      eventIds,
    );

    const customFieldsMap = new Map<string, CustomFieldsMap>();
    allCustomFields.forEach((cf) => {
      let entry = customFieldsMap.get(cf.entityId);
      if (!entry) {
        entry = {};
        customFieldsMap.set(cf.entityId, entry);
      }
      entry[cf.fieldKey] = cf.value;
    });

    return events.map((e) => ({
      ...e,
      customFields: customFieldsMap.get(e.id) || {},
    }));
  }

  async findOne(id: string, user: AuthorizedUser): Promise<CalendarEventWithCustomFields> {
    const qb = this._eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.id = :id', { id })
      .andWhere('event.companyId = :companyId', { companyId: user.companyId });

    const event = await qb.getOne();

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const isOrganizer = event.organizerId === user.id;
    const isParticipant = event.participants.some((p) => p.userId === user.id);

    if (!isOrganizer && !isParticipant) {
      throw new ForbiddenException('You do not have access to this event');
    }

    const customFields = await this._customFieldsService.getValues(
      user.companyId,
      EntityType.CALENDAR_EVENT,
      event.id,
    );

    return {
      ...event,
      customFields,
    };
  }

  async create(dto: CreateEventDto, user: AuthorizedUser): Promise<CalendarEventWithCustomFields> {
    const { participantIds, customFields, ...eventData } = dto;

    const event = this._eventsRepository.create({
      ...eventData,
      organizerId: user.id,
      companyId: user.companyId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });

    const savedEvent = await this._eventsRepository.save(event);

    if (customFields) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.CALENDAR_EVENT,
        savedEvent.id,
        customFields,
      );
    }

    const participants: Partial<CalendarEventParticipant>[] = [];

    participants.push({
      eventId: savedEvent.id,
      userId: user.id,
      status: ParticipantStatus.ACCEPTED,
    });

    if (participantIds && participantIds.length > 0) {
      const uniqueParticipantIds = [...new Set(participantIds.filter((id) => id !== user.id))];

      uniqueParticipantIds.forEach((pUserId) => {
        participants.push({
          eventId: savedEvent.id,
          userId: pUserId,
          status: ParticipantStatus.PENDING,
        });
      });
    }

    await this._participantsRepository.save(this._participantsRepository.create(participants));

    // Notifications for participants (excluding organizer)
    if (participantIds && participantIds.length > 0) {
      const uniqueParticipantIds = [...new Set(participantIds.filter((id) => id !== user.id))];
      uniqueParticipantIds.forEach((pUserId) => {
        this._eventBus.emit(
          'notification.calendar_invited',
          new CalendarEventInvitedEvent(pUserId, {
            eventId: savedEvent.id,
            eventTitle: savedEvent.title,
            startTime: savedEvent.startTime,
          }),
        );
      });
    }

    return this.findOne(savedEvent.id, user);
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    user: AuthorizedUser,
  ): Promise<CalendarEventWithCustomFields> {
    const event = await this.findOne(id, user);

    if (event.organizerId !== user.id) {
      throw new ForbiddenException('Only the organizer can update the event');
    }

    const { participantIds, customFields, ...updateData } = dto;

    Object.assign(event, {
      ...updateData,
      startTime: dto.startTime ? new Date(dto.startTime) : event.startTime,
      endTime: dto.endTime ? new Date(dto.endTime) : event.endTime,
    });

    const saved = await this._eventsRepository.save(event);

    if (customFields !== undefined) {
      await this._customFieldsService.setValues(
        user.companyId,
        EntityType.CALENDAR_EVENT,
        saved.id,
        customFields,
      );
    }

    if (participantIds !== undefined) {
      const currentParticipantIds = event.participants.map((p) => p.userId);
      const newParticipantIds = [...new Set(participantIds.filter((pid) => pid !== user.id))];

      const toRemove = event.participants.filter(
        (p) => p.userId !== user.id && !newParticipantIds.includes(p.userId),
      );
      if (toRemove.length > 0) {
        await this._participantsRepository.remove(toRemove);
      }

      const toAdd = newParticipantIds.filter((pid) => !currentParticipantIds.includes(pid));
      if (toAdd.length > 0) {
        const newParticipants = toAdd.map((pid) =>
          this._participantsRepository.create({
            eventId: event.id,
            userId: pid,
            status: ParticipantStatus.PENDING,
          }),
        );
        await this._participantsRepository.save(newParticipants);

        // Notify only newly added participants
        toAdd.forEach((pUserId) => {
          this._eventBus.emit(
            'notification.calendar_invited',
            new CalendarEventInvitedEvent(pUserId, {
              eventId: event.id,
              eventTitle: event.title,
              startTime: event.startTime,
            }),
          );
        });
      }
    }

    return this.findOne(id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    const event = await this.findOne(id, user);

    if (event.organizerId !== user.id) {
      throw new ForbiddenException('Only the organizer can delete the event');
    }

    await this._eventsRepository.remove(event);
  }

  async respond(id: string, status: ParticipantStatus, user: AuthorizedUser): Promise<void> {
    const participant = await this._participantsRepository.findOne({
      where: {
        eventId: id,
        userId: user.id,
      },
    });

    if (!participant) {
      throw new NotFoundException('You are not a participant of this event');
    }

    participant.status = status;
    await this._participantsRepository.save(participant);
  }
}
