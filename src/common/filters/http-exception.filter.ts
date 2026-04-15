import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as string | { message: string | string[]; error: string };

    const errorMessage =
      typeof error === 'string'
        ? error
        : Array.isArray(error.message)
          ? error.message[0]
          : error.message || error.error;

    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${errorMessage}`,
      exception.stack,
    );

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: errorMessage,
    });
  }
}
