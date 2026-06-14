import { Injectable, Logger } from '@nestjs/common';
import * as amqp from 'amqplib';

type AuditEventPayload = {
  eventType: string;
  userId?: string | null;
  emailAttempted?: string | null;
  ip?: string;
  userAgent?: string;
  success?: boolean;
  createdAt: string;
  source: string;
};

@Injectable()
export class RabbitMqService {
  private readonly logger = new Logger(RabbitMqService.name);

  private readonly rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

  async publishAuditEvent(payload: AuditEventPayload) {
    const queueName = 'audit.events.queue';

    const connection = await amqp.connect(this.rabbitUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, {
      durable: true,
    });

    channel.sendToQueue(queueName, Buffer.from(JSON.stringify(payload)), {
      persistent: true,
    });

    this.logger.log(`Audit event published to ${queueName}`);

    await channel.close();
    await connection.close();

    return payload;
  }
  async publishTestAuditEvent() {
    return this.publishAuditEvent({
      eventType: 'auth.login.success',
      userId: null,
      emailAttempted: 'demo@example.com',
      ip: '127.0.0.1',
      userAgent: 'curl',
      success: true,
      createdAt: new Date().toISOString(),
      source: 'backend',
    });
  }
}
