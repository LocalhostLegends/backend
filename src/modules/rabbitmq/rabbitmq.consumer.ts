import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { AuditLogService } from '@modules/audit/audit-log.service';
import * as amqp from 'amqplib';

type AuditEventMessage = {
  eventType: string;
  userId?: string | null;
  emailAttempted?: string | null;
  ip?: string;
  userAgent?: string;
  requestId?: string;
  method?: string;
  path?: string;
  success?: boolean;
  failureReason?: string | null;
  createdAt?: string;
  source?: string;
};

@Injectable()
export class RabbitMqConsumer implements OnModuleInit {
  private readonly logger = new Logger(RabbitMqConsumer.name);

  private readonly rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  constructor(private readonly auditLogService: AuditLogService) {}

  async onModuleInit() {
    await this.consumeAuditEvents();
  }

  private async consumeAuditEvents() {
    const queueName = 'audit.events.queue';

    const connection = await amqp.connect(this.rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    this.logger.log(`Listening RabbitMQ queue: ${queueName}`);

    await channel.consume(queueName, (message) => {
      void this.handleAuditMessage(channel, message);
    });
  }

  private async handleAuditMessage(channel: amqp.Channel, message: amqp.ConsumeMessage | null) {
    if (!message) return;

    try {
      const payload = JSON.parse(message.content.toString()) as AuditEventMessage;

      this.logger.log(`Received audit event: ${JSON.stringify(payload)}`);

      await this.auditLogService.createAuthLog({
        eventType: payload.eventType,
        userId: payload.userId ?? null,
        emailAttempted: payload.emailAttempted ?? null,
        ip: payload.ip,
        userAgent: payload.userAgent,
        requestId: payload.requestId,
        method: payload.method,
        path: payload.path,
        success: payload.success ?? true,
        failureReason: payload.failureReason ?? null,
        enrichmentStatus: 'pending',
      });

      this.logger.log(`Audit event saved from RabbitMQ: ${payload.eventType}`);

      channel.ack(message);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error(`Failed to process audit event: ${errorMessage}`);

      channel.nack(message, false, false);
    }
  }
}
