import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuthAuditLogEntity } from './entities/auth-audit-log.entity';
import { CreateAuthAuditLogInput } from './audit.types';

@Injectable()
export class AuditLogService {
  constructor(
    @InjectRepository(AuthAuditLogEntity)
    private readonly authAuditLogRepository: Repository<AuthAuditLogEntity>,
  ) {}

  async createAuthLog(input: CreateAuthAuditLogInput): Promise<AuthAuditLogEntity> {
    const auditLog = this.authAuditLogRepository.create({
      eventType: input.eventType,
      userId: input.userId ?? null,
      emailAttempted: input.emailAttempted ?? null,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      requestId: input.requestId ?? null,
      method: input.method ?? null,
      path: input.path ?? null,
      success: input.success,
      failureReason: input.failureReason ?? null,
      enrichmentStatus: input.enrichmentStatus ?? 'pending',
    });

    return this.authAuditLogRepository.save(auditLog);
  }
}
