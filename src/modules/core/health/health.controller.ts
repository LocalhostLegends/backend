import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { StorageService } from '@modules/storage/storage.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
  ) {}

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

  @Get('storage')
  async checkStorage() {
    try {
      return await this.storageService.checkHealth();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown storage error';

      return {
        status: 'error',
        storage: 'disconnected',
        message,
      };
    }
  }

  @Get('version')
  version() {
    return {
      status: 'ok',
      commit: process.env.RENDER_GIT_COMMIT || process.env.GIT_COMMIT || 'unknown',
      branch: process.env.RENDER_GIT_BRANCH || process.env.GIT_BRANCH || 'unknown',
      environment: process.env.NODE_ENV || 'unknown',
    };
  }
}
