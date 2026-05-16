import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LeaveAuditLog } from '@database/entities/leave-audit-log.entity';
import { LeaveAuditEventType } from '@common/enums/leave-audit-event-type.enum';

@Injectable()
export class LeaveAuditService {
  constructor(
    @InjectRepository(LeaveAuditLog)
    private readonly auditRepository: Repository<LeaveAuditLog>,
  ) {}

  async log(
    leaveRequestId: string,
    actorId: string | null,
    eventType: LeaveAuditEventType,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const log = this.auditRepository.create({
      leaveRequestId,
      actorId,
      eventType,
      metadata,
    });
    await this.auditRepository.save(log);
  }

  async findByRequestId(leaveRequestId: string): Promise<LeaveAuditLog[]> {
    return this.auditRepository.find({
      where: { leaveRequestId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
    });
  }
}
