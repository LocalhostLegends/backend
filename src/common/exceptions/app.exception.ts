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
    const messages = ExceptionMessages as Record<ExceptionCode, (...args: unknown[]) => string>;
    const messageFn = messages[code];
    const args = (params ?? []) as unknown[];
    const message = typeof messageFn === 'function' ? messageFn(...args) : code;

    super(message, status);
    this.code = code;
    this.context = context;
  }
}
