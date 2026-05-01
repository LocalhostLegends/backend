import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { AppException } from '../exceptions/app.exception';

interface ErrorResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number = 500;
    let code: string = 'INTERNAL_ERROR';
    let message: string | string[] = 'Internal server error';
    let context: Record<string, unknown> | undefined = undefined;

    if (exception instanceof AppException) {
      const appEx = exception as AppException;
      status = appEx.getStatus();
      code = String(appEx.code);
      message = appEx.message;
      context = appEx.context;
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

    const logMessage = Array.isArray(message) ? message.join(', ') : message;

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${code} - ${logMessage}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      code,
      message,
      timestamp: new Date().toISOString(),
      ...(context && { context }),
    });
  }
}
