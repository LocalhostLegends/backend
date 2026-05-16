import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

import { logger } from '@common/logger/pino.config';

import { AppRequest } from '../types/common.types';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: AppRequest, res: Response, next: NextFunction) {
    const start = Date.now();

    const { method, originalUrl } = req;

    res.on('finish', () => {
      const durationMs = Date.now() - start;

      logger.info({
        message: 'HTTP request completed',
        method,
        path: originalUrl,
        statusCode: res.statusCode,
        durationMs,
        requestId: req.context?.requestId,
        ip: req.context?.ip,
        userAgent: req.context?.userAgent,
      });
    });

    next();
  }
}
