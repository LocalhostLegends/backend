import { HttpException, HttpStatus } from '@nestjs/common';
import { ExceptionCode } from './exception-codes';
import { ExceptionMessages } from './exception-messages';
import { ExceptionParams } from './exception.types';

export class AppException<K extends ExceptionCode = ExceptionCode> extends HttpException {
  public readonly code: K;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: K,
    status: HttpStatus,
    params?: ExceptionParams[K],
    context?: Record<string, unknown>,
  ) {
    const messageFn = ExceptionMessages[code] as (...args: ExceptionParams[K]) => string;
    const args = (params ?? []) as ExceptionParams[K];
    const message = messageFn(...args);

    super(message, status);
    this.code = code;
    this.context = context;
  }
}
