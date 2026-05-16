import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { logger } from '@common/logger/pino.config';

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

    const savedAuditLog = await this.authAuditLogRepository.save(auditLog);

    logger.info({
      message: 'Auth audit event',
      eventType: savedAuditLog.eventType,
      userId: savedAuditLog.userId,
      emailAttempted: savedAuditLog.emailAttempted,
      ip: savedAuditLog.ip,
      userAgent: savedAuditLog.userAgent,
      requestId: savedAuditLog.requestId,
      method: savedAuditLog.method,
      path: savedAuditLog.path,
      success: savedAuditLog.success,
      failureReason: savedAuditLog.failureReason,
      enrichmentStatus: savedAuditLog.enrichmentStatus,
      riskScore: savedAuditLog.riskScore,
      suspicious: savedAuditLog.suspicious,
      country: savedAuditLog.country,
      city: savedAuditLog.city,
      browser: savedAuditLog.browser,
      os: savedAuditLog.os,
      deviceType: savedAuditLog.deviceType,
      createdAt: savedAuditLog.createdAt,
    });

    return savedAuditLog;
  }
}
