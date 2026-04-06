import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthAuditLogEntity } from './entities/auth-audit-log.entity';
import { AuditLogService } from './audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuthAuditLogEntity])],
  providers: [AuditLogService],
  exports: [TypeOrmModule, AuditLogService],
})
export class AuditModule {}
