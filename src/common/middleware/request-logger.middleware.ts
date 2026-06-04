import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { logger } from '@common/logger/pino.config';
import { MetricsService } from '@modules/metrics/metrics.service';

import { AppRequest } from '../types/common.types';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly metricsService: MetricsService) {}

  use(req: AppRequest, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl } = req;

    logger.info({
      message: 'HTTP request started',
      method,
      path: originalUrl,
      requestId: req.context?.requestId,
      ip: req.context?.ip,
      userAgent: req.context?.userAgent,
    });

    res.on('finish', () => {
      const durationMs = Date.now() - start;
      const statusCode = res.statusCode;

      if (!originalUrl.includes('/metrics')) {
        this.metricsService.recordHttpRequest({
          method,
          path: originalUrl,
          statusCode,
          durationMs,
        });
      }

      logger.info({
        message: 'HTTP request completed',
        method,
        path: originalUrl,
        statusCode,
        durationMs,
        requestId: req.context?.requestId,
        ip: req.context?.ip,
        userAgent: req.context?.userAgent,
      });
    });

    next();
  }
}
