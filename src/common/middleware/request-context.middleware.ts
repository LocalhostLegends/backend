import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { randomUUID } from 'crypto';

import { AppRequest } from '../types/common.types';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: AppRequest, _res: Response, next: NextFunction) {
    const requestId = randomUUID();

    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    let ip = 'unknown';

    if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
      ip = forwardedFor.split(',')[0].trim();
    } else if (typeof realIp === 'string' && realIp.length > 0) {
      ip = realIp.trim();
    } else if (req.ip) {
      ip = req.ip;
    } else if (req.socket?.remoteAddress) {
      ip = req.socket.remoteAddress;
    }

    const userAgent =
      typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : 'unknown';

    req.context = {
      requestId,
      ip,
      userAgent,
      method: req.method,
      path: req.originalUrl || req.url,
      startedAt: Date.now(),
    };

    next();
  }
}
