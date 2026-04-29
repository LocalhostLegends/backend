import { Request } from 'express';
import { ApiPropertyOptions } from '@nestjs/swagger';

import { AuthorizedUser } from '@modules/core/users/users.types';

export interface AppRequest extends Request {
  user?: AuthorizedUser;
  context?: AppRequestContext;
}

export interface AppRequestContext {
  requestId: string;
  ip: string;
  userAgent: string;
  method: string;
  path: string;
  startedAt: number;
}

export interface AppResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}

export type SwaggerFieldsMap = Record<string, ApiPropertyOptions & { description: string }>;
