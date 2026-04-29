import { ExecutionContext, ForbiddenException } from '@nestjs/common';

import { AppRequest } from '../types/common.types';

export function getAppRequest(context: ExecutionContext) {
  return context.switchToHttp().getRequest<AppRequest>();
}

export function getAppRequestUser(context: ExecutionContext) {
  const { user } = getAppRequest(context);

  if (!user) {
    throw new ForbiddenException('User context is missing in request');
  }

  return user;
}
