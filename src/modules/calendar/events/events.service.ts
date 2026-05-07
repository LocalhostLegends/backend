import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { CalendarEvent } from '@database/entities/calendar-event.entity';
import { CalendarEventParticipant } from '@database/entities/calendar-event-participant.entity';
import { AuthorizedUser } from '@modules/core/users/users.types';
import { ParticipantStatus } from '@common/enums/participant-status.enum';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { QueryEventDto } from './dto/query-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(CalendarEvent)
    private readonly _eventsRepository: Repository<CalendarEvent>,
    @InjectRepository(CalendarEventParticipant)
    private readonly _participantsRepository: Repository<CalendarEventParticipant>,
  ) {}

  async findAll(query: QueryEventDto, user: AuthorizedUser): Promise<CalendarEvent[]> {
    const { startDate, endDate } = query;

    const qb = this._eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.participants', 'participant')
      .leftJoinAndSelect('participant.user', 'user')
      .leftJoinAndSelect('event.organizer', 'organizer')
      .where('event.companyId = :companyId', { companyId: user.companyId });

    // User must be either organizer or participant
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

    return qb.getMany();
  }

  async findOne(id: string, user: AuthorizedUser): Promise<CalendarEvent> {
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

    // Check if user is organizer or participant
    const isOrganizer = event.organizerId === user.id;
    const isParticipant = event.participants.some((p) => p.userId === user.id);

    if (!isOrganizer && !isParticipant) {
      throw new ForbiddenException('You do not have access to this event');
    }

    return event;
  }

  async create(dto: CreateEventDto, user: AuthorizedUser): Promise<CalendarEvent> {
    const { participantIds, ...eventData } = dto;

    const event = this._eventsRepository.create({
      ...eventData,
      organizerId: user.id,
      companyId: user.companyId,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
    });

    const savedEvent = await this._eventsRepository.save(event);

    // Add participants
    const participants: Partial<CalendarEventParticipant>[] = [];

    // Organizer is always a participant with ACCEPTED status
    participants.push({
      eventId: savedEvent.id,
      userId: user.id,
      status: ParticipantStatus.ACCEPTED,
    });

    if (participantIds && participantIds.length > 0) {
      // Filter out organizer if they were included in participantIds
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

    return this.findOne(savedEvent.id, user);
  }

  async update(id: string, dto: UpdateEventDto, user: AuthorizedUser): Promise<CalendarEvent> {
    const event = await this.findOne(id, user);

    // Only organizer can update main event details
    if (event.organizerId !== user.id) {
      throw new ForbiddenException('Only the organizer can update the event');
    }

    const { participantIds, ...updateData } = dto;

    Object.assign(event, {
      ...updateData,
      startTime: dto.startTime ? new Date(dto.startTime) : event.startTime,
      endTime: dto.endTime ? new Date(dto.endTime) : event.endTime,
    });

    await this._eventsRepository.save(event);

    if (participantIds !== undefined) {
      // Update participants list
      const currentParticipantIds = event.participants.map((p) => p.userId);
      const newParticipantIds = [...new Set(participantIds.filter((pid) => pid !== user.id))];

      // Remove participants not in new list
      const toRemove = event.participants.filter(
        (p) => p.userId !== user.id && !newParticipantIds.includes(p.userId),
      );
      if (toRemove.length > 0) {
        await this._participantsRepository.remove(toRemove);
      }

      // Add new participants
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
      }
    }

    return this.findOne(id, user);
  }

  async remove(id: string, user: AuthorizedUser): Promise<void> {
    const event = await this.findOne(id, user);

    // Only organizer can delete
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
