import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response, Request } from 'express';

import { logger } from '@common/logger/pino.config';

import { AppException } from '../exceptions/app.exception';
import { AppRequest } from '../types/common.types';

interface ErrorResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>() as AppRequest;

    let status: number = 500;
    let code: string = 'INTERNAL_ERROR';
    let message: string | string[] = 'Internal server error';
    let context: Record<string, unknown> | undefined = undefined;

    if (exception instanceof AppException) {
      status = exception.getStatus();
      code = String(exception.code);
      message = exception.message;
      context = exception.context;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res: unknown = exception.getResponse();

      if (res && typeof res === 'object') {
        const errorRes = res as ErrorResponse;
        message = errorRes.message || errorRes.error || exception.message;
      } else if (typeof res === 'string') {
        message = res;
      }

      code = `HTTP_${status}`;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorMessage = Array.isArray(message) ? message.join(', ') : message;

    logger.error({
      message: 'HTTP exception',
      method: request.method,
      path: request.url,
      statusCode: status,
      code,
      errorMessage,
      requestId: request.context?.requestId,
      ip: request.context?.ip,
      userAgent: request.context?.userAgent,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: request.context?.requestId,
      ...(context && { context }),
    });
  }
}
