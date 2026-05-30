import { Controller, Get, Headers, Res, UnauthorizedException } from '@nestjs/common';
import type { Response } from 'express';

import { Public } from '@/common/decorators/public.decorator';
import config from '@config/app.config';

import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Public()
  @Get()
  async getMetrics(
    @Headers('x-metrics-key') metricsKey: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Res() res: Response,
  ): Promise<void> {
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.replace('Bearer ', '').trim()
      : undefined;

    const providedKey = (metricsKey ?? bearerToken)?.trim();
    const expectedKey = config.metrics.apiKey.trim();

    if (providedKey !== expectedKey) {
      throw new UnauthorizedException('Invalid metrics key');
    }
    res.setHeader('Content-Type', this.metricsService.getContentType());
    res.send(await this.metricsService.getMetrics());
  }
}
