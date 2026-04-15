import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';

export interface RequestContext {
  requestId: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  startedAt: number;
}

export interface RequestWithContext extends Request {
  context?: RequestContext;
}

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestWithContext, _res: Response, next: NextFunction) {
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
