import { Module } from '@nestjs/common';
import { AuditModule } from '@modules/audit/audit.module';
import { RabbitMqConsumer } from './rabbitmq.consumer';
import { RabbitMqController } from './rabbitmq.controller';
import { RabbitMqService } from './rabbitmq.service';

@Module({
  imports: [AuditModule],
  controllers: [RabbitMqController],
  providers: [RabbitMqService, RabbitMqConsumer],
  exports: [RabbitMqService],
})
export class RabbitMqModule {}
