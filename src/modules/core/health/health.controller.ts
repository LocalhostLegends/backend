import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  health() {
    return { status: 'ok' };
  }

  @Get('database')
  async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        status: 'ok',
        database: 'connected',
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown database error';

      return {
        status: 'error',
        database: 'disconnected',
        message,
      };
    }
  }
}
