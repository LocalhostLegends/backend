import { Controller, Post } from '@nestjs/common';
import { Public } from '@common/decorators/public.decorator';
import { RabbitMqService } from './rabbitmq.service';

@Controller('rabbitmq')
export class RabbitMqController {
  constructor(private readonly rabbitMqService: RabbitMqService) {}

  @Public()
  @Post('audit-test')
  async publishTestAuditEvent() {
    return this.rabbitMqService.publishTestAuditEvent();
  }
}
